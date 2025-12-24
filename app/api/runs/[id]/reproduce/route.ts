
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const runId = params.id;

    try {
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { jobs: true, artifacts: true }
        });

        if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

        // Dedupe / Rate Limit: Check for recent PRODUCER job in last 10s
        const recentJob = await prisma.job.findFirst({
            where: {
                runId: run.id,
                agent: 'PRODUCER',
                createdAt: { gt: new Date(Date.now() - 10000) }
            }
        });

        if (recentJob) {
            // Rate limited
            // Return redirect anyway to avoid error page, but don't queue new job
            return NextResponse.redirect(new URL(`/projects/${run.id}`, req.url), 303);
        }

        // Logic: Reset to PRODUCING phase.
        // 1. Mark existing PRODUCER jobs as 'IGNORED' or just leave them done?
        //    Better to just leave them. New jobs will be picked up.
        // 2. Find the PLAN artifact to input into Producer.
        const planArtifact = run.artifacts.find(a => a.fileName.includes('PLAN'));
        if (!planArtifact) {
            // Fallback: Use initial job input if no plan artifact
            return NextResponse.json({ error: "No PLAN artifact found to reproduce from." }, { status: 400 });
        }

        // 3. Enqueue PRODUCER Job(s)
        //    In a complex system, we might re-enqueue all items from the plan.
        //    For v0.9 single-producer simplified flow:
        await prisma.job.create({
            data: {
                type: 'agent',
                agent: 'PRODUCER',
                status: 'QUEUED',
                runId: run.id,
                projectId: run.projectId,
                phaseId: run.phaseId,
                input: JSON.stringify({
                    instruction: "Reproduce content based on PLAN",
                    planContent: planArtifact.contentText
                })
            }
        });

        // 4. Update Run Status
        await prisma.run.update({
            where: { id: run.id },
            data: { status: 'PRODUCING' }
        });

        return NextResponse.redirect(new URL(`/projects/${run.id}`, req.url), 303);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
