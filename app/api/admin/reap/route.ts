import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    // Solo Security: Token check
    const token = req.headers.get('x-admin-token');
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken && token !== adminToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const staleTime = new Date(Date.now() - 90000);
        const result = await prisma.job.updateMany({
            where: {
                status: "RUNNING",
                lockedAt: { lt: staleTime },
            },
            data: {
                status: "QUEUED",
                lockedAt: null,
                lockedBy: null,
            },
        });

        return NextResponse.json({ reaped: result.count });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Reap failed" }, { status: 500 });
    }
}
