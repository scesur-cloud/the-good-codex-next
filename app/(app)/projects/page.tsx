
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
    Folder,
    Clock,
    Play
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

export default async function ProjectsPage() {
    const runs = await prisma.run.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { jobs: true, artifacts: true }
            }
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Folder className="h-6 w-6 text-indigo-400" />
                        Projeler
                    </h1>
                    <p className="mt-1 text-slate-400">
                        Tüm otomasyon süreçleri ve run geçmişi.
                    </p>
                </div>
                <Link
                    href="/planner"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2"
                >
                    <Play className="h-4 w-4 fill-current" />
                    Yeni Run Başlat
                </Link>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">ID / Proje</th>
                            <th className="px-6 py-4">Faz</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4">İstatistikler</th>
                            <th className="px-6 py-4">Tarih</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {runs.map((run) => (
                            <tr key={run.id} className="hover:bg-indigo-500/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{run.projectId}</div>
                                    <div className="text-[10px] font-mono text-slate-500 opacity-70">#{run.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded text-xs">
                                        {run.phaseId.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wider ${statusColor(run.status)}`}>
                                        {run.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-4 text-xs text-slate-400">
                                        <div title="Total Artifacts">
                                            <span className="font-bold text-white">{run._count.artifacts}</span> Artifacts
                                        </div>
                                        <div title="Total Jobs">
                                            <span className="font-bold text-white">{run._count.jobs}</span> Jobs
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {new Date(run.createdAt).toLocaleString('tr-TR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/projects/${run.projectId}/phases/${run.phaseId}?runId=${run.id}`}
                                        className="text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-wider bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/20 hover:border-indigo-500/50 transition-all"
                                    >
                                        Console &rarr;
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
