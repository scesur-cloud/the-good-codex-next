
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const runId = params.id;

    try {
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { artifacts: true }
        });

        if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

        // Dedupe / Rate Limit: Check for recent QA job in last 10s
        const recentJob = await prisma.job.findFirst({
            where: {
                runId: run.id,
                agent: 'QA',
                createdAt: { gt: new Date(Date.now() - 10000) }
            }
        });

        if (recentJob) {
            return NextResponse.redirect(new URL(`/projects/${run.id}`, req.url), 303);
        }

        // Logic: Re-run QA on all OUTPUT artifacts
        const outputs = run.artifacts.filter(a => !a.fileName.includes('PLAN') && !a.fileName.includes('BRIEF'));

        if (outputs.length === 0) {
            return NextResponse.json({ error: "No output artifacts to QA." }, { status: 400 });
        }

        // 1. Enqueue QA Job
        await prisma.job.create({
            data: {
                type: 'agent',
                agent: 'QA',
                status: 'QUEUED',
                runId: run.id,
                projectId: run.projectId,
                phaseId: run.phaseId,
                input: JSON.stringify({
                    instruction: "Re-evaluate all candidates",
                    candidateIds: outputs.map(a => a.id)
                })
            }
        });

        // 2. Update Run Status
        await prisma.run.update({
            where: { id: run.id },
            data: { status: 'QA' }
        });

        return NextResponse.redirect(new URL(`/projects/${run.id}`, req.url), 303);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
