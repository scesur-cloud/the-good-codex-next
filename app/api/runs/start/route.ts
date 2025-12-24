
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.formData().catch(() => null) || await req.json().catch(() => null);
        let runId;

        if (body instanceof FormData) {
            runId = body.get('runId') as string;
        } else {
            runId = body?.runId;
        }

        if (!runId) {
            return NextResponse.json({ error: "Missing runId" }, { status: 400 });
        }

        const run = await prisma.run.findUnique({ where: { id: runId } });
        if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

        // Check if already started
        if (run.status !== 'PLANNING' && run.status !== 'ERROR') {
            // Already running or done
            return NextResponse.redirect(new URL(`/projects/${run.projectId}/runs/${run.id}`, req.url));
        }

        // Idempotent: Only enqueue if no "PLANNER" job exists
        const existingJob = await prisma.job.findFirst({
            where: { runId: runId, agent: 'PLANNER' }
        });

        if (!existingJob) {
            await prisma.job.create({
                data: {
                    type: 'agent',
                    agent: 'PLANNER',
                    status: 'QUEUED',
                    runId: run.id,
                    projectId: run.projectId,
                    phaseId: run.phaseId,
                    input: JSON.stringify({ trigger: 'manual_start' }) // The plan will be derived from input artifacts if any, or default context
                }
            });

            // Update run timestamps
            await prisma.run.update({
                where: { id: runId },
                data: {
                    status: 'PLANNING',
                    startedAt: new Date()
                }
            });
        }

        return NextResponse.redirect(new URL(`/projects/${run.projectId}`, req.url));

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
