
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const template = await prisma.projectTemplate.findUnique({
            where: { id: params.id }
        });

        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        return NextResponse.json(template);

    } catch (e: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
