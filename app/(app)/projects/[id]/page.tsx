
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    Activity,
    Terminal,
    FileText,
    Layers,
    Copy
} from 'lucide-react';
import { PHASES } from '@/lib/phases';
import RunOpsActions from '@/components/RunOpsActions';

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

const statusMap: Record<string, string> = {
    'PLANNING': 'Plan üretiliyor...',
    'PRODUCING': 'Üretim işleri çalışıyor...',
    'QA': 'Rubric değerlendirmesi yapılıyor...',
    'DONE': 'Tamamlandı.',
    'ERROR': 'Hata oluştu.'
};

export default async function ProjectRunDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const run = await prisma.run.findUnique({
        where: { id: params.id },
        include: {
            jobs: true,
            artifacts: true,
            evaluations: true
        }
    });

    if (!run) return notFound();

    // 1. Worker Warning Check
    const stuckJob = run.jobs.find(j =>
        j.status === 'QUEUED' &&
        (Date.now() - new Date(j.updatedAt).getTime() > 60000)
    );
    const showWorkerWarning = Boolean(stuckJob);

    // 2. No Winner Check
    // If run is DONE but no artifact is marked as final.
    const hasFinal = run.artifacts.some(a => a.isFinal);
    const noWinner = run.status === 'DONE' && !hasFinal;

    // Check if auto-start is needed (stuck in PLANNING with 0 jobs)
    const needsStart = run.status === 'PLANNING' && run.jobs.length === 0;

    return (
        <div className="space-y-8">
            {/* ETAP C: Ops Visibility & Self-Heal */}
            <RunOpsActions
                runId={run.id}
                jobs={run.jobs.map(j => ({ ...j, createdAt: j.createdAt.toISOString(), startedAt: j.startedAt?.toISOString() || null, finishedAt: j.finishedAt?.toISOString() || null, updatedAt: j.updatedAt.toISOString() }))}
                status={run.status}
                adminEnabled={Boolean(process.env.ADMIN_TOKEN)}
                adminToken={process.env.ADMIN_TOKEN}
            />

            {noWinner && (
                <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-indigo-500/20">
                            <Layers className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-indigo-200">Final Artifact Seçilemedi (No Winner)</h3>
                            <p className="text-xs text-indigo-300/70 mt-1 mb-3">
                                Üretilen çıktılar QA barajını geçemedi. Kriterleri gevşetebilir veya tekrar deneyebilirsiniz.
                            </p>
                            <div className="flex gap-2">
                                <form action={`/api/runs/${run.id}/reproduce`} method="POST">
                                    <button type="submit" className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
                                        Outputs&apos;u Yeniden Üret
                                    </button>
                                </form>
                                <form action={`/api/runs/${run.id}/reqa`} method="POST">
                                    <button type="submit" className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors">
                                        QA&apos;yı Tekrar Çalıştır
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <Link href="/projects" className="text-sm text-slate-500 hover:text-indigo-400 flex items-center gap-1 mb-4">
                    <ArrowLeft className="h-4 w-4" /> Tüm Projeler
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">
                                {run.projectId} / {run.phaseId.toUpperCase()}
                            </h1>
                            <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wider ${statusColor(run.status)}`}>
                                {run.status}
                                <span className="opacity-70 font-normal border-l border-white/20 pl-2 ml-1 hidden sm:inline-block">
                                    {statusMap[run.status] || ''}
                                </span>
                            </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-slate-500">Run ID: {run.id}</p>

                        {/* Active Progress Bar */}
                        {['PLANNING', 'PRODUCING', 'QA'].includes(run.status) && (
                            <div className="mt-2 w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 animate-progress-indeterminate origin-left"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {needsStart && (
                            <form action="/api/runs/start" method="POST">
                                <input type="hidden" name="runId" value={run.id} />
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/20"
                                >
                                    <Clock className="h-4 w-4" />
                                    Force Start
                                </button>
                            </form>
                        )}
                        <a
                            href={`/api/runs/${run.id}/export`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg shadow-slate-900/20 transition-all border border-slate-700"
                        >
                            <FileText className="h-4 w-4" />
                            Export
                        </a>

                        <form action="/api/templates/create" method="POST" className="inline-block">
                            <input type="hidden" name="runId" value={run.id} />
                            <input type="hidden" name="name" value={`${run.projectId} (Template)`} />
                            <button
                                type="submit"
                                title="Save as Template"
                                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-pink-900/20 hover:bg-pink-900/40 text-pink-400 font-bold border border-pink-500/20 transition-colors ml-2"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </form>
                        <Link
                            href={`/projects/${params.id}/phases/${run.phaseId}?runId=${run.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Terminal className="h-4 w-4" />
                            Open Phase Runner
                        </Link>
                    </div>
                </div>
            </div>

            {/* Timeline & Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* Timeline Section */}


                    {/* Phase Timeline Section */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Operations Pipeline
                        </h2>
                        <div className="relative pl-2">
                            {/* Connector Line */}
                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-800" />

                            <div className="space-y-6 relative">
                                {PHASES.map((phase, idx) => {
                                    const currentPhaseIndex = PHASES.findIndex(p => p.id === run.phaseId);
                                    let statusColor = "bg-slate-800 border-slate-700 text-slate-500";
                                    let icon = <Clock className="h-4 w-4" />;
                                    let isActive = false;

                                    if (idx < currentPhaseIndex) {
                                        // Completed
                                        statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                                        icon = <CheckCircle className="h-4 w-4" />;
                                    } else if (idx === currentPhaseIndex) {
                                        // Current
                                        isActive = true;
                                        // Use run status to color
                                        if (run.status === 'DONE') {
                                            // If run is DONE but phase is current, it means either it just finished or is stuck (No Winner)
                                            // If it finished properly it would have advanced.
                                            // So likely "No Winner" or "Error"
                                            statusColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
                                            icon = <Activity className="h-4 w-4" />;
                                        } else {
                                            statusColor = "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse";
                                            icon = <Activity className="h-4 w-4" />;
                                        }
                                    } else {
                                        // Future
                                        statusColor = "bg-slate-800/50 border-slate-800 text-slate-600";
                                        icon = <Calendar className="h-4 w-4" />;
                                    }

                                    return (
                                        <div key={phase.id} className="flex items-center gap-4 relative">
                                            <div className={`h-8 w-8 rounded-full border flex items-center justify-center z-10 transition-all ${statusColor} ${isActive ? 'ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-slate-900' : ''}`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <div className={`text-xs uppercase font-bold ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                                                    {phase.id.toUpperCase()}
                                                </div>
                                                <div className={`text-sm ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
                                                    {phase.name}
                                                </div>
                                                {isActive && (
                                                    <div className="text-xs text-slate-500 mt-1 font-mono">
                                                        Status: <span className="text-white">{run.status}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Jobs List (Mini) */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Recent Jobs
                        </h2>
                        {run.jobs.length === 0 ? (
                            <div className="text-sm text-slate-500 italic">No jobs yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {run.jobs.slice().reverse().slice(0, 5).map(job => (
                                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 text-xs font-mono border border-slate-800/50">
                                        <span className="font-bold text-indigo-400">{job.agent}</span>
                                        <span className="text-slate-400">{job.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Artifacts Summary */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Outputs
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Jobs</span>
                                <span className="text-white font-mono">{run.jobs.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Artifacts</span>
                                <span className="text-white font-mono">{run.artifacts.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Evaluations</span>
                                <span className="text-white font-mono">{run.evaluations.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rubric Display */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Active Rubric
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <span className="text-sm text-white font-bold">Standard (EDU_V1)</span>
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                                    PASS &ge; 70
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs text-slate-400">
                                    <p className="mb-1"><strong className="text-slate-300">Length Check:</strong></p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>&gt; 100 chars: <span className="text-emerald-400">80 pts</span></li>
                                        <li>&le; 100 chars: <span className="text-amber-500">40 pts</span></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="pt-2 text-[10px] text-slate-600 italic">
                                * Otomatik değerlendirme kriterleri.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
