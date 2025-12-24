import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const runId = params.id;

    try {
        const result = await prisma.job.updateMany({
            where: {
                runId,
                status: { in: ["QUEUED", "RUNNING"] }
            },
            data: {
                status: "QUEUED",
                lockedAt: null,
                lockedBy: null
            },
        });

        return NextResponse.json({ reset: result.count });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Reset failed" }, { status: 500 });
    }
}
