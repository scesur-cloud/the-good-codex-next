"use client";

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Zap, ShieldAlert, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    runId: string;
    jobs: any[];
    status: string;
    adminEnabled?: boolean;
    adminToken?: string;
}

export default function RunOpsActions({ runId, jobs, status, adminEnabled, adminToken }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Calc diagnostics
    const queuedJobs = jobs.filter(j => j.status === 'QUEUED');
    const runningJobs = jobs.filter(j => j.status === 'RUNNING');
    const errorJobs = jobs.filter(j => j.status === 'ERROR');

    // A job is likely "stale" if it has been running for > 90s without completion
    const staleJobs = runningJobs.filter(j => {
        const start = new Date(j.startedAt || j.updatedAt).getTime();
        return (Date.now() - start) > 90000;
    });

    const isStuck = (queuedJobs.length > 0 || runningJobs.length > 0) && (status !== 'DONE' && status !== 'ERROR');

    // If there are queued jobs but none have been updated in last 60s, worker might be dead
    const lastUpdate = Math.max(...jobs.map(j => new Date(j.updatedAt).getTime()), 0);
    const maybeWorkerDead = isStuck && (Date.now() - lastUpdate > 60000);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    async function handleReap() {
        setLoading(true);
        try {
            await fetch('/api/admin/reap', {
                method: 'POST',
                headers: adminToken ? { 'x-admin-token': adminToken } : {}
            });
            setCooldown(10);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleReset() {
        setLoading(true);
        try {
            await fetch(`/api/runs/${runId}/reset-stuck`, {
                method: 'POST',
                headers: adminToken ? { 'x-admin-token': adminToken } : {}
            });
            setCooldown(10);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (!isStuck && errorJobs.length === 0 && staleJobs.length === 0) return null;

    return (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 text-amber-500">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider">Operasyonel Teşhis (Why Stuck?)</h3>
                        <p className="text-xs text-amber-500/70">Sistem anomalisi tespit edildi.</p>
                    </div>
                </div>
                {maybeWorkerDead && (
                    <div className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase animate-pulse">
                        Worker Offline?
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Bekleyen İşler</div>
                    <div className="text-xl font-mono text-white">{queuedJobs.length}</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Aktif Kilitler</div>
                    <div className="text-xl font-mono text-white">{runningJobs.length}</div>
                    {staleJobs.length > 0 && <span className="text-[9px] text-red-400 font-bold">({staleJobs.length} bayat)</span>}
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Son Güncelleme</div>
                    <div className="text-xl font-mono text-white">
                        {lastUpdate === 0 ? '---' : `${Math.round((Date.now() - lastUpdate) / 1000)}s önce`}
                    </div>
                </div>
            </div>

            {/* Diagnostic Message */}
            <div className="text-xs text-amber-200/80 bg-amber-900/20 p-3 rounded border border-amber-500/10">
                {staleJobs.length > 0 ? (
                    <p>⚠️ <strong>Bayat Kilit Tespit Edildi:</strong> Bazı işler kilitli kalmış ancak ilerlemiyor. &quot;Global Reap&quot; önerilir.</p>
                ) : maybeWorkerDead ? (
                    <p>⚠️ <strong>Worker Sessizliği:</strong> İşler sırada bekliyor ancak hiçbir worker bunları almıyor. Lütfen terminalden worker&apos;ı başlatın.</p>
                ) : errorJobs.length > 0 ? (
                    <p>⚠️ <strong>Hata Kayıtları:</strong> Bazı işler hataya düştü. &quot;Reset Stuck&quot; ile tekrar sıraya koyabilirsiniz.</p>
                ) : (
                    <p>ℹ️ Pipeline normal hızında ilerliyor ancak kuyruk derinliği artıyor.</p>
                )}
            </div>

            {/* Actions: ETAP E Solo UX */}
            {adminEnabled && (
                <div className="flex gap-2 pt-2 border-t border-amber-500/10">
                    <button
                        onClick={handleReap}
                        disabled={loading || cooldown > 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50 transition-all"
                    >
                        <Zap className="h-4 w-4" />
                        {loading ? 'Reaping...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Global Reap (Unlock All)'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={loading || cooldown > 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-50 transition-all border border-slate-700"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Resetting...' : 'Reset Run (Retry Queued)'}
                    </button>
                </div>
            )}
        </div>
    );
}
