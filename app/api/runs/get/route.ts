import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RunGetResponse, AgentType, JobStatus, ArtifactDto } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');
    const projectId = searchParams.get('projectId');
    const phaseId = searchParams.get('phaseId');

    try {
        let runData;

        const includeConfig = {
            jobs: { orderBy: { createdAt: 'asc' as const } },
            evaluations: true,
            artifacts: { orderBy: { createdAt: 'asc' as const } }
        };

        if (runId) {
            runData = await prisma.run.findUnique({
                where: { id: runId },
                include: includeConfig
            });
        } else if (projectId && phaseId) {
            runData = await prisma.run.findFirst({
                where: { projectId, phaseId },
                orderBy: { createdAt: 'desc' },
                include: includeConfig
            });
        }

        if (!runData) {
            return NextResponse.json({
                run: null,
                stats: {
                    PLANNER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    PRODUCER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    QA: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    FIXER: { pending: 0, inFlight: 0, done: 0, failed: 0 }
                }
            });
        }

        // 1. Calculate Stats
        const stats: Record<AgentType, { pending: number, inFlight: number, done: number, failed: number }> = {
            PLANNER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
            PRODUCER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
            QA: { pending: 0, inFlight: 0, done: 0, failed: 0 },
            FIXER: { pending: 0, inFlight: 0, done: 0, failed: 0 }
        };

        runData.jobs.forEach((j: any) => {
            const agent = j.agent as AgentType;
            if (stats[agent]) {
                // status mapping: pending, running, done, error
                // In DB we used lowercase.
                if (j.status === 'pending') stats[agent].pending++;
                else if (j.status === 'running') stats[agent].inFlight++;
                else if (j.status === 'done') stats[agent].done++;
                else if (j.status === 'error') stats[agent].failed++;
            }
        });

        // 2. Determine Final Artifact (Server-side Logic)
        // If run is DONE, try to pick the best PASS artifact
        let finalArtifactId = null;
        const passEvals = runData.evaluations.filter(e => e.verdict === 'PASS').sort((a, b) => b.score - a.score);
        if (passEvals.length > 0) {
            finalArtifactId = passEvals[0].artifactId;
        }

        // 3. Map Artifacts to DTO
        const artifacts: ArtifactDto[] = runData.artifacts.map(a => ({
            id: a.id,
            // Logic: PLAN.json -> PLAN, others -> OUTPUT
            kind: a.fileName === 'PLAN.json' ? 'PLAN' : 'OUTPUT',
            agent: a.fileName === 'PLAN.json' ? 'PLANNER' : 'PRODUCER', // simplistic inference
            title: a.fileName,
            qaStatus: a.qaStatus as any,
            createdAt: a.createdAt.toISOString()
        }));

        // 4. Construct Response
        const response: RunGetResponse = {
            run: {
                id: runData.id,
                projectId: runData.projectId,
                phaseId: runData.phaseId,
                mode: runData.mode as any,
                status: runData.status as any,
                createdAt: runData.createdAt.toISOString(),
                startedAt: runData.startedAt?.toISOString(),
                finishedAt: runData.finishedAt?.toISOString(),
                jobs: runData.jobs.map((j: any) => ({
                    id: j.id,
                    agent: j.agent as AgentType,
                    status: j.status as JobStatus,
                    createdAt: j.createdAt.toISOString(),
                    startedAt: j.startedAt?.toISOString(),
                    finishedAt: j.finishedAt?.toISOString(),
                    error: j.error
                })),
                evaluations: runData.evaluations.map(e => ({
                    id: e.id,
                    rubricKey: e.rubricKey,
                    verdict: e.verdict as any,
                    score: e.score,
                    artifactId: e.artifactId,
                    createdAt: e.createdAt.toISOString()
                })),
                artifacts,
                finalArtifactId,
            },
            stats
        };

        // 5. ETAP C: Ops Telemetry
        try {
            const nowMinus60 = new Date(Date.now() - 60000);
            const activeWorkers = await prisma.workerHeartbeat.groupBy({
                by: ['workerId'],
                where: { ts: { gte: nowMinus60 } },
            });
            const lastHeartbeat = await prisma.workerHeartbeat.findFirst({
                orderBy: { ts: 'desc' }
            });
            const queueDepth = await prisma.job.count({ where: { status: 'QUEUED' } });
            const runningJobs = await prisma.job.count({ where: { status: 'RUNNING' } });

            const staleLocksCount = await prisma.job.count({
                where: {
                    status: 'RUNNING',
                    lockedAt: { lt: new Date(Date.now() - 90000) }
                }
            });

            // Get last job for this run (if runId provided) or globally if not
            const lastJobRaw = await prisma.job.findFirst({
                where: runId ? { runId } : {},
                orderBy: { updatedAt: 'desc' }
            });

            response.ops = {
                activeWorkers: activeWorkers.length,
                lastHeartbeatTs: lastHeartbeat?.ts.toISOString() || null,
                queueDepth,
                runningJobs,
                adminEnabled: Boolean(process.env.ADMIN_TOKEN),
                stuckHints: {
                    staleLocks: staleLocksCount,
                    noWorker: activeWorkers.length === 0 && queueDepth > 0
                },
                lastJob: lastJobRaw ? {
                    id: lastJobRaw.id,
                    agent: lastJobRaw.agent,
                    status: lastJobRaw.status,
                    attempts: lastJobRaw.attempts as number,
                    lockedAt: lastJobRaw.lockedAt?.toISOString() || null,
                    lockedBy: lastJobRaw.lockedBy,
                    lastError: lastJobRaw.lastError,
                    updatedAt: lastJobRaw.updatedAt.toISOString()
                } : undefined
            };
        } catch (opsError) {
            console.error("Ops Telemetry failed", opsError);
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
