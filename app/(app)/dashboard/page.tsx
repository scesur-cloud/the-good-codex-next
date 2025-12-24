
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
    Activity,
    ArrowRight,
    CheckCircle,
    FileText,
    Play,
    LayoutDashboard,
    Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusColor(s: string) {
    switch (s) {
        case 'DONE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'QA': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'PRODUCING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'PLANNING': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'ERROR': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
}

export default async function DashboardPage() {
    // 1. Fetch KPIs in parallel
    const [
        totalRuns,
        totalArtifacts,
        totalEvals,
        passingEvals,
        recentRuns
    ] = await Promise.all([
        prisma.run.count(),
        prisma.artifact.count(),
        prisma.artifactEvaluation.count(),
        prisma.artifactEvaluation.count({ where: { verdict: 'PASS' } }),
        prisma.run.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { jobs: true } // to count active jobs if needed
        })
    ]);

    const passRate = totalEvals > 0 ? Math.round((passingEvals / totalEvals) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="h-8 w-8 text-indigo-400" />
                            Operasyonel Yönetim Paneli
                        </h1>
                        <p className="mt-2 text-indigo-200/70 max-w-xl">
                            Pipeline motoru (v0.9) hazır. Projeleri buradan başlatıp yönetebilirsiniz.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/projects"
                            className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition font-medium"
                        >
                            Tüm Projeler
                        </Link>

                        <form action="/api/runs/create" method="POST">
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition font-medium flex items-center gap-2"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                Demo Oluştur
                            </button>
                        </form>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Activity className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Toplam Teslimat</div>
                        <div className="text-3xl font-bold text-white mt-1">{totalRuns} <span className="text-base font-normal text-slate-500">Run</span></div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <FileText className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Üretilen Artifakt</div>
                        <div className="text-3xl font-bold text-white mt-1">{totalArtifacts} <span className="text-base font-normal text-slate-500">Çıktı</span></div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">QA Başarı Oranı</div>
                        <div className="text-3xl font-bold text-white mt-1">%{passRate} <span className="text-base font-normal text-slate-500">Pass</span></div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        Son Aktiviteler
                    </h2>
                    <Link href="/projects" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                        Hepsini Gör <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                    {recentRuns.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <p>Henüz bir çalışma bulunamadı.</p>
                            <form action="/api/runs/create" method="POST" className="mt-4">
                                <button className="text-indigo-400 hover:text-indigo-300 underline">İlk Demoyu Başlat</button>
                            </form>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">ID / Proje</th>
                                    <th className="px-6 py-4">Faz</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4 text-right">Eylem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {recentRuns.map((run) => (
                                    <tr key={run.id} className="hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{run.projectId}</div>
                                            <div className="text-[10px] font-mono text-slate-500 opacity-70">#{run.id.slice(-8)}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-300">
                                            {run.phaseId.toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wider ${statusColor(run.status)}`}>
                                                {run.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(run.createdAt).toLocaleString('tr-TR', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/projects/${run.projectId}/phases/${run.phaseId}?runId=${run.id}`}
                                                className="text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-wider"
                                            >
                                                Yönet &rarr;
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
