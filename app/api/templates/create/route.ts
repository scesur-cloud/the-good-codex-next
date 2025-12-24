
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { runId, name } = await req.json();

        if (!runId || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch Run and its Planner Job
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { jobs: true } // Need jobs to find PLANNER input
        });

        if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

        // 2. Extract Brief Config from Planner Job Input
        const plannerJob = run.jobs.find(j => j.agent === 'PLANNER');
        if (!plannerJob) {
            return NextResponse.json({ error: "Original planner job not found" }, { status: 400 });
        }

        let briefConfigStr = plannerJob.input;

        // 3. Infer Rubric
        // Usually stored in briefConfig, or we check the run/brief text.
        // For v0.9.4, we hardcoded logic in UI but didn't store it explicitly in Run model.
        // However, the `input` JSON usually has `brief: { ... }`.

        // Let's parse input just to peek (optional validation)
        let rubricId = "EDU_V1"; // Default fall back
        try {
            const input = JSON.parse(briefConfigStr);
            // If the template system v0.9.4 UI is used, input struct is:
            // { projectName: "...", brief: { goal: "", format: "Tech Doc (Rubric: EDU_V1)", ... } }

            const format = input.brief?.format || "";
            if (format.includes("EDU_V1")) rubricId = "EDU_V1";
            else if (format.includes("CORP_STD")) rubricId = "CORP_STD";
            else if (format.includes("SOCIAL_ENG")) rubricId = "SOCIAL_ENG";
            else if (format.includes("TECH_SPEC")) rubricId = "TECH_SPEC";

        } catch (e) {
            // keep raw string if parse fails
        }

        // 4. Create Template (Dedupe name?)
        const template = await prisma.projectTemplate.create({
            data: {
                name,
                briefConfig: briefConfigStr, // Store the raw input payload to reuse in /api/runs/create
                rubricId
            }
        });

        return NextResponse.json({ success: true, templateId: template.id });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
    }
}
