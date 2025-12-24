"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RunGetResponse } from "../types";
import { RunConsole } from "./RunConsole";
import { ArrowLeft } from "lucide-react";

// --- Types ---
type Artifact = NonNullable<NonNullable<RunGetResponse["run"]>["artifacts"]>[number];
type Evaluation = NonNullable<NonNullable<RunGetResponse["run"]>["evaluations"]>[number];

// --- Helpers ---
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function pickBestEval(evals: Evaluation[]) {
  if (!evals.length) return null;
  return [...evals].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
}

function qaBadgeClass(qa?: string | null) {
  if (qa === "PASS") return "bg-emerald-600/20 text-emerald-200 border-emerald-600/30";
  if (qa === "FAIL") return "bg-rose-600/20 text-rose-200 border-rose-600/30";
  if (qa === "PENDING") return "bg-amber-600/20 text-amber-200 border-amber-600/30";
  return "bg-white/10 text-white/70 border-white/15";
}

// --- Smart Container ---
export const PhaseDetail = ({ projectId, phaseId, onBack }: { projectId: string; phaseId: string; onBack?: () => void }) => {
  // State
  const [data, setData] = useState<RunGetResponse | null>(null);
  const [providers, setProviders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyStart, setBusyStart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const pollTimer = useRef<number | null>(null);

  // 1) Provider health check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const health = await fetchJson<Record<string, string>>("/api/health/providers");
        if (!cancelled) setProviders(health);
      } catch (e) {
        if (!cancelled) setProviders({ gemini: "UNKNOWN" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) Poll Run State
  useEffect(() => {
    isMounted.current = true;

    async function pollOnce() {
      try {
        setError(null);
        const next = await fetchJson<RunGetResponse>(`/api/runs/get?projectId=${projectId}&phaseId=${phaseId}`);
        if (!isMounted.current) return;
        setData(next);
        setLoading(false);

        const status = next.run?.status;
        const nextDelay = (status === "DONE" || status === "ERROR") ? 2500 : 700;
        pollTimer.current = window.setTimeout(pollOnce, nextDelay);
      } catch (e: any) {
        if (!isMounted.current) return;
        setLoading(false);
        if (!e.message.includes("404")) {
          // Only show error if it's not just "not found yet"
          // setError(e.message);
        }
        pollTimer.current = window.setTimeout(pollOnce, 2500);
      }
    }
    pollOnce();

    return () => {
      isMounted.current = false;
      if (pollTimer.current) window.clearTimeout(pollTimer.current);
    };
  }, [projectId, phaseId]);

  // 3) Auto Run Action
  async function onAutoRun() {
    setBusyStart(true);
    try {

      const runRes = await fetchJson<any>(`/api/runs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, phaseId, mode: "AUTO" }),
      });
      // No need to call start - create already starts it.
      console.log("Run created:", runRes);
      // Polling will update state
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyStart(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </button>

        {/* Console */}
        <RunConsole
          data={data}
          providers={providers}
          loading={loading}
          onAutoRun={onAutoRun}
          busyStart={busyStart}
          error={error}
        />

        {/* Artifacts View */}
        {data?.run && <ArtifactsView data={data} />}
      </div>
    </div>
  );
};

// --- Presentational: Artifacts View ---
function ArtifactsView({ data }: { data: RunGetResponse }) {
  const run = data.run!;


  const finalId = run.finalArtifactId ?? null;

  const evalByArtifact = useMemo(() => {
    const map = new Map<string, Evaluation[]>();
    const all = run.evaluations || [];
    for (const e of all) {
      const arr = map.get(e.artifactId) || [];
      arr.push(e as any);
      map.set(e.artifactId, arr);
    }
    return map;
  }, [run.evaluations]);

  const artifacts = useMemo(() => {
    return (run.artifacts || []).map((a) => {
      const evals = evalByArtifact.get(a.id) || [];
      const best = pickBestEval(evals as any);
      return {
        ...a,
        bestEval: best,
        isFinal: finalId === a.id,
      };
    });
  }, [run.artifacts, evalByArtifact, finalId]);

  const plan = artifacts.filter((a) => a.kind === "PLAN");
  const outputs = artifacts.filter((a) => a.kind === "OUTPUT");

  const [selectedId, setSelectedId] = useState<string>(() => finalId || outputs[0]?.id || plan[0]?.id || "");
  const selected = artifacts.find((a) => a.id === selectedId) || null;

  // Effect to select final automatically when it appears
  useEffect(() => {
    if (finalId) setSelectedId(finalId);
  }, [finalId]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 h-[600px]">
      {/* LEFT: list */}
      <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2">
        <Section title="PLAN">
          {plan.length === 0 ? (
            <Empty text="No plan yet." />
          ) : (
            plan.map((a) => <ArtifactRow key={a.id} a={a as any} selectedId={selectedId} onSelect={setSelectedId} />)
          )}
        </Section>

        <Section title="OUTPUTS">
          {outputs.length === 0 ? (
            <Empty text="No outputs yet." />
          ) : (
            outputs.map((a) => <ArtifactRow key={a.id} a={a as any} selectedId={selectedId} onSelect={setSelectedId} />)
          )}
        </Section>
      </div>

      {/* RIGHT: preview */}
      <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col overflow-hidden">
        {!selected ? (
          <Empty text="Select an artifact to preview." />
        ) : (
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="text-lg font-semibold text-white">
                  {selected.title}
                  {selected.isFinal && (
                    <span className="ml-2 rounded border border-emerald-600/30 bg-emerald-600/20 px-2 py-0.5 text-xs text-emerald-200">
                      FINAL
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs opacity-80" suppressHydrationWarning>
                  {selected.agent} • {selected.kind} • {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded border px-2 py-0.5 text-xs ${qaBadgeClass(selected.qaStatus)}`}>
                  QA: {selected.qaStatus || "—"}
                </span>
                {typeof selected.bestEval?.score === "number" && (
                  <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5 text-xs text-white/80">
                    Score: {selected.bestEval.score}
                  </span>
                )}
              </div>
            </div>

            {/* EVAL */}
            <div className="rounded-lg border border-white/10 bg-black/10 p-3 shrink-0">
              <div className="text-sm font-medium mb-1 text-slate-300">Evaluation</div>
              {selected.bestEval ? (
                <div className="text-sm">
                  <div className="text-xs opacity-80 mb-1">
                    {selected.bestEval.rubricKey} • {selected.bestEval.verdict}
                  </div>
                  <div className="text-sm text-slate-400">{selected.bestEval.summary ?? "(no summary)"}</div>
                </div>
              ) : (
                <div className="text-xs opacity-70">No evaluation yet.</div>
              )}
            </div>

            {/* CONTENT */}
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 flex-1 overflow-auto">
              <div className="text-sm font-medium mb-2 text-slate-300">Preview</div>
              <pre className="whitespace-pre-wrap text-xs leading-5 text-white/85 font-mono">
                {/* Content placeholder - v0.9 limitation */}
                {String((selected as any).content || "Content preview not available in v0.9 listing mode.\n(Artifact content is stored in DB/Blob)")}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-sm font-semibold mb-2 text-slate-400">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs opacity-70 italic">{text}</div>;
}

function ArtifactRow({
  a,
  selectedId,
  onSelect,
}: {
  a: Artifact & { bestEval?: any; isFinal?: boolean };
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const isSelected = selectedId === a.id;

  return (
    <button
      onClick={() => onSelect(a.id)}
      className={`w-full text-left rounded-lg border p-2 transition ${a.isFinal ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-black/10"
        } ${isSelected ? "ring-2 ring-indigo-500/50 bg-indigo-500/10" : "hover:bg-white/5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-slate-200">
            {a.title}
            {a.isFinal && <span className="ml-2 text-xs text-emerald-200 font-bold">FINAL</span>}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500 uppercase tracking-widest">
            {a.agent} • {a.kind}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${qaBadgeClass(a.qaStatus)}`}>
            {a.qaStatus || "—"}
          </span>
          {typeof (a as any).bestEval?.score === "number" && (
            <span className="text-[10px] opacity-60 font-mono">Sc:{(a as any).bestEval.score}</span>
          )}
        </div>
      </div>
    </button>
  );
}
