
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Users, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RaciPage() {
    // 1. Find the latest run with a PLAN artifact
    // In a real app, this would be scoped to the "current project" selected by the user.
    // For now, we take the latest active run.
    const run = await prisma.run.findFirst({
        where: { jobs: { some: { agent: 'PLANNER', status: { in: ['DONE', 'RUNNING'] } } } },
        orderBy: { createdAt: 'desc' },
        include: { artifacts: true }
    });

    const planArtifact = run?.artifacts.find(a => a.fileName.includes('PLAN') || a.fileName.includes('BRIEF'));

    // Naive parsing: Look for RACI Matrix or Roles section
    // Real implementation would use structured JSON output from Planner.
    const content = planArtifact?.contentText || "";
    const hasRaci = content.toLowerCase().includes('raci');

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-indigo-400" />
                RACI Matrisi
            </h1>

            {!run ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <p className="text-slate-400">Henüz aktif bir proje yok.</p>
                    <Link href="/planner" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors">
                        Yeni Proje Başlat
                    </Link>
                </div>
            ) : !planArtifact ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto opacity-50" />
                    <h3 className="text-lg font-bold text-white">Plan Bulunamadı</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        &quot;{run.projectId}&quot; için RACI matrisi oluşturulacak bir plan dosyası (PLAN.md) henüz yok veya formatı uygun değil.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <Link href={`/projects/${run.id}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors">
                            Run Durumunu Kontrol Et
                        </Link>
                        <Link href="/planner" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors">
                            Yeni Plan Oluştur
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Proje: {run.projectId}
                        </h2>
                        <span className="text-xs text-slate-500 font-mono">Kaynak: {planArtifact.fileName}</span>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap border border-slate-700/50">
                        {content.length > 500 ? content.slice(0, 500) + '...' : content}
                        {/* 
                            TODO: Implement real Markdown Table parsing here.
                            For now, showing raw plan snippet ensures user sees "something" derived.
                        */}
                    </div>

                    <div className="text-xs text-slate-500 text-center italic">
                        * Bu görünüm &quot;{planArtifact.fileName}&quot; içeriğinden otomatik türetilmiştir.
                    </div>
                </div>
            )}
        </div>
    );
}
