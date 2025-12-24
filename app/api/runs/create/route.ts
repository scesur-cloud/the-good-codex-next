
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectName, brief } = body;

        // Validations
        const safeProjectName = (projectName || 'Demo Project').replace(/[^a-zA-Z0-9-_]/g, '-');

        // 1. Create Run
        const run = await prisma.run.create({
            data: {
                projectId: safeProjectName,
                phaseId: 'm1', // Default start phase
                mode: 'AUTO',
                status: 'PLANNING',
                startedAt: new Date() // Mark started immediately
            }
        });

        // 2. Create Initial Artifact (The Brief) - Input for Planner
        if (brief) {
            await prisma.artifact.create({
                data: {
                    projectId: run.projectId,
                    phaseId: run.phaseId,
                    runId: run.id,
                    fileName: 'BRIEF.md',
                    mimeType: 'text/markdown',
                    contentText: `# Project Brief: ${projectName}\n\n**Goal**: ${brief.goal}\n**Audience**: ${brief.audience}\n**Format**: ${brief.format}\n**Tone**: ${brief.tone}`,
                    isFinal: false
                }
            });
        }

        // 3. Enqueue Planner Job (Auto Start)
        await prisma.job.create({
            data: {
                type: 'agent',
                agent: 'PLANNER',
                status: 'QUEUED',
                runId: run.id,
                projectId: run.projectId,
                phaseId: run.phaseId,
                input: JSON.stringify({
                    instruction: "Analyze BRIEF.md and generate a PLAN.md",
                    brief: brief
                })
            }
        });

        // Return redirect URL or info
        return NextResponse.json({
            success: true,
            runId: run.id,
            redirect: `/projects/${run.id}` // Redirect to Run Detail
        });

    } catch (e) {
        console.error("Create Run Error", e);
        return NextResponse.json({ error: "Failed to create run" }, { status: 500 });
    }
}
