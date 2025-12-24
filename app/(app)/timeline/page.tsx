
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Clock, CalendarDays, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
    const run = await prisma.run.findFirst({
        where: { jobs: { some: { agent: 'PLANNER', status: { in: ['DONE', 'RUNNING'] } } } },
        orderBy: { createdAt: 'desc' },
        include: { artifacts: true }
    });

    const planArtifact = run?.artifacts.find(a => a.fileName.includes('PLAN'));

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Clock className="h-6 w-6 text-indigo-400" />
                Zaman Çizelgesi
            </h1>

            {!run ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <p className="text-slate-400">Henüz aktif bir proje yok.</p>
                    <Link href="/planner" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors">
                        Plan Oluştur
                    </Link>
                </div>
            ) : !planArtifact ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto opacity-50" />
                    <h3 className="text-lg font-bold text-white">Zaman Çizelgesi Oluşmadı</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        &quot;{run.projectId}&quot; için zaman çizelgesini çıkarabileceğimiz bir PLAN.md dosyası henüz oluşmadı.
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
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Proje: {run.projectId}
                        </h2>
                    </div>

                    <div className="relative border-l border-slate-700 ml-4 space-y-8">
                        {/* Simulation of phases based on standard flow */}
                        <div className="relative pl-8">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Başlangıç (Planning)</span>
                                <span className="text-xs text-slate-500 font-mono">{new Date(run.createdAt).toLocaleDateString()}</span>
                                <p className="mt-2 text-slate-400 text-sm">Proje oluşturuldu ve planlama başladı.</p>
                            </div>
                        </div>

                        <div className="relative pl-8 opacity-50">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-600 ring-4 ring-slate-900"></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Üretim (Production)</span>
                                <span className="text-xs text-slate-500 font-mono">TBD</span>
                                <p className="mt-2 text-slate-400 text-sm">İçerik üretimi planlandı.</p>
                            </div>
                        </div>

                        <div className="relative pl-8 opacity-30">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-600 ring-4 ring-slate-900"></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Teslimat (QA & Final)</span>
                                <span className="text-xs text-slate-500 font-mono">TBD</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
