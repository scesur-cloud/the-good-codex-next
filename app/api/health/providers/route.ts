import { NextResponse } from 'next/server';

export async function GET() {
    // Support both legacy VITE_ prefix and standard naming
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const status = (geminiKey && geminiKey.length > 0) ? "OK" : "MISSING";

    return NextResponse.json({
        gemini: status
    });
}
