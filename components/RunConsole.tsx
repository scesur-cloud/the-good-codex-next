"use client";

import React, { useMemo } from "react";
import type { RunGetResponse } from "../types";
import { Play } from "lucide-react";

type ProvidersHealth = Record<string, string>;

function badgeClass(kind: "ok" | "warn" | "bad") {
    if (kind === "ok") return "bg-emerald-600/20 text-emerald-200 border-emerald-600/30";
    if (kind === "warn") return "bg-amber-600/20 text-amber-200 border-amber-600/30";
    return "bg-rose-600/20 text-rose-200 border-rose-600/30";
}

function humanJobStatus(s: string) {
    switch (s?.toLowerCase()) {
        case "pending": return "PENDING";
        case "running": return "IN-FLIGHT";
        case "done": return "DONE";
        case "error":
        case "failed": return "FAILED";
        default: return s?.toUpperCase() || "UNKNOWN";
    }
}

interface RunConsoleProps {
    data: RunGetResponse | null;
    providers: ProvidersHealth | null;
    loading: boolean;
    onAutoRun: () => void;
    busyStart: boolean;
    error: string | null;
}

export const RunConsole: React.FC<RunConsoleProps> = ({
    data,
    providers,
    loading,
    onAutoRun,
    busyStart,
    error
}) => {
    const run = data?.run ?? null;
    const finalArtifactId = run?.finalArtifactId ?? null;
    const finalReady = Boolean(finalArtifactId);

    const geminiStatus = providers?.gemini;
    const providerOk = geminiStatus ? geminiStatus === "OK" : true;

    const logs = useMemo(() => {
        const jobs = run?.jobs ?? [];
        const sorted = [...jobs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return sorted.map((j) => {
            const agent = j.agent;
            const st = humanJobStatus(j.status);
            const msg = j.stepKey || "Job";
            const errMsg = j.error ? ` | ${j.error}` : "";
            return `[${agent}] ${st} ${msg}${errMsg}`.trim();
        });
    }, [run?.jobs]);

    const status = run?.status ?? "READY";

    return (
        <div className="w-full space-y-4 font-sans text-slate-200">
            <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-slate-100">Run Console</div>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wider ${badgeClass(status === "DONE" ? "ok" : status === "ERROR" ? "bad" : "warn")}`}>
                        {status}
                    </span>
                    {finalReady ? (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wider ${badgeClass("ok")}`}>
                            FINAL ARTIFACT READY
                        </span>
                    ) : status === "DONE" ? (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wider ${badgeClass("warn")}`}>
                            NO PASSING ARTIFACT
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    {providers?.gemini && (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${providers.gemini === "OK" ? badgeClass("ok") : badgeClass("bad")}`}>
                            GEMINI: {providers.gemini}
                        </span>
                    )}

                    <button
                        onClick={onAutoRun}
                        disabled={busyStart || (status !== "DONE" && status !== "READY" && status !== "ERROR")}
                        className={`rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-900/40 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {busyStart ? "STARTING..." : "AUTO RUN"}
                    </button>
                </div>
            </div>

            {status === "DONE" && !finalReady && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                    <h3 className="text-lg font-bold text-amber-200 mb-2">Bu koşuda PASS alan artifact yok. FINAL seçilemedi.</h3>
                    <p className="text-amber-200/70 text-sm mb-4">
                        Üretilen içerikler QA kriterlerini karşılamadı. Lütfen prompt&apos;u veya kriterleri gözden geçirip tekrar deneyin.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onAutoRun}
                            disabled={busyStart}
                            className="px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Yeniden Başlat
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Agent Stats</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {data?.stats
                        ? (Object.entries(data.stats) as any[]).map(([agent, s]) => (
                            <div key={agent} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{agent}</div>
                                <div className="flex justify-between text-xs font-mono text-slate-300">
                                    <span className="text-slate-500" title="Pending">P:{s.pending}</span>
                                    <span className="text-amber-500" title="Running">R:{s.inFlight}</span>
                                    <span className="text-emerald-500" title="Done">D:{s.done}</span>
                                    <span className="text-red-500" title="Failed">F:{s.failed}</span>
                                </div>
                            </div>
                        ))
                        : <div className="text-xs opacity-70">No active run stats.</div>}
                </div>
            </div>

            {/* Logs */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Logs</div>
                <div className="h-48 overflow-auto rounded-lg border border-slate-800 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-slate-300">
                    {loading && <div className="opacity-70">Loading...</div>}
                    {!loading && logs.length === 0 && <div className="opacity-70">Waiting for events...</div>}
                    {logs.map((line, idx) => (
                        <div key={idx} className="whitespace-pre-wrap py-0.5 border-b border-white/5 last:border-0">
                            {line}
                        </div>
                    ))}
                </div>
            </div>
            {error && <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-200 text-xs">{error}</div>}
        </div>
    );
};
