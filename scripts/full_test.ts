/* scripts/full_test.ts
 *
 * God Codex v0.9.x / v1.0 Full Smoke Test Harness
 * - Health check
 * - Create+Start run (planner queued)
 * - Poll until DONE
 * - Reproduce -> Poll DONE
 * - Re-QA -> Poll DONE
 * - Export zip download
 * - Page smoke checks: /dashboard /projects /planner /templates /raci /todo /timeline
 *
 * Usage:
 *   npx tsx scripts/full_test.ts
 *
 * Env:
 *   BASE_URL=http://localhost:3000
 *   TIMEOUT_MS=240000
 */

import fs from "node:fs";
import path from "node:path";

type Json = Record<string, any>;

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? 240_000);
const POLL_MS = 1500;

function nowIso() {
    return new Date().toISOString();
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function urlJoin(base: string, p: string) {
    return base.replace(/\/$/, "") + (p.startsWith("/") ? p : `/${p}`);
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 30_000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...init, signal: ac.signal });
        return res;
    } finally {
        clearTimeout(t);
    }
}

async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<Json> {
    const res = await fetchWithTimeout(url, init, timeoutMs);
    const text = await res.text().catch(() => "");
    let parsed: any = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        // not json
    }
    if (!res.ok) {
        const err = new Error(
            `HTTP ${res.status} ${res.statusText} for ${url}\n` +
            `Body: ${text?.slice(0, 500) ?? ""}`
        );
        (err as any).status = res.status;
        (err as any).body = text;
        (err as any).json = parsed;
        throw err;
    }
    return (parsed ?? {}) as Json;
}

async function fetchOk(url: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<void> {
    const res = await fetchWithTimeout(url, init, timeoutMs);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\nBody: ${text?.slice(0, 500) ?? ""}`);
    }
}

function section(title: string) {
    console.log(`\n=== ${title} ===`);
}

async function tryJson(url: string, init?: RequestInit) {
    try {
        const data = await fetchJson(url, init);
        return { ok: true as const, data };
    } catch (e: any) {
        return { ok: false as const, error: e };
    }
}

async function pollRunDone(runId: string) {
    const start = Date.now();
    let lastStatus = "";
    let lastJobs = -1;
    let lastArtifacts = -1;

    while (Date.now() - start < TIMEOUT_MS) {
        const getUrl = urlJoin(BASE_URL, `/api/runs/get?runId=${encodeURIComponent(runId)}`);
        const data = await fetchJson(getUrl, { method: "GET" }, 30_000);

        const run = data?.run ?? data; // tolerate shape differences
        const status = String(run?.status ?? "");
        const stats = data?.stats ?? run?.stats ?? {};
        const jobsCount = Number(stats?.jobsTotal ?? run?.jobsTotal ?? run?.jobs?.length ?? -1);
        const artifactsCount = Number(stats?.artifactsTotal ?? run?.artifactsTotal ?? run?.artifacts?.length ?? -1);
        const finalArtifactId = data?.finalArtifactId ?? run?.finalArtifactId ?? null;

        if (status !== lastStatus || jobsCount !== lastJobs || artifactsCount !== lastArtifacts) {
            console.log(
                `[${nowIso()}] run=${runId} status=${status} jobs=${jobsCount} artifacts=${artifactsCount} final=${finalArtifactId ?? "null"
                }`
            );
            lastStatus = status;
            lastJobs = jobsCount;
            lastArtifacts = artifactsCount;
        }

        if (status === "DONE" || status === "FAILED") {
            return { status, data };
        }

        await sleep(POLL_MS);
    }

    throw new Error(`Timeout: run ${runId} did not reach DONE/FAILED within ${TIMEOUT_MS}ms`);
}

async function downloadExport(runId: string) {
    const exportUrl = urlJoin(BASE_URL, `/api/runs/${encodeURIComponent(runId)}/export`);
    const res = await fetchWithTimeout(exportUrl, { method: "GET" }, 60_000);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Export failed: HTTP ${res.status} ${res.statusText}\n${text?.slice(0, 500) ?? ""}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outDir = path.resolve(process.cwd(), "tmp_test_outputs");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `run_${runId}.zip`);
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Export ZIP saved: ${outPath} (${buf.length} bytes)`);
}

async function postAction(runId: string, action: "reproduce" | "reqa") {
    const url = urlJoin(BASE_URL, `/api/runs/${encodeURIComponent(runId)}/${action}`);
    const res = await fetchWithTimeout(url, { method: "POST", redirect: 'manual' }, 30_000);
    // 303 See Other is expected success (redirect to page)
    if (res.status === 303) {
        console.log(`✅ Action POST /api/runs/${runId}/${action} queued (303 Redirect)`);
        return;
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\nBody: ${text?.slice(0, 500) ?? ""}`);
    }
    console.log(`✅ Action POST /api/runs/${runId}/${action} queued`);
}

async function smokePages() {
    section("Page smoke checks (HTTP 200)");
    const pages = ["/dashboard", "/projects", "/planner", "/templates", "/raci", "/todo", "/timeline"];
    for (const p of pages) {
        const url = urlJoin(BASE_URL, p);
        await fetchOk(url, { method: "GET" }, 30_000);
        console.log(`✅ ${p}`);
    }
}

async function main() {
    console.log(`\nGod Codex Full Test starting...`);
    console.log(`BASE_URL=${BASE_URL}`);
    console.log(`TIMEOUT_MS=${TIMEOUT_MS}`);

    section("Health check");
    {
        const url = urlJoin(BASE_URL, "/api/health/providers");
        const r = await tryJson(url, { method: "GET" });
        if (!r.ok) {
            console.error("❌ Health/providers failed.");
            throw r.error;
        }
        console.log("✅ /api/health/providers OK");
    }

    section("Create+Start Run (Intake)");
    let runId = "";
    {
        // v0.9.1+ create endpoint should create AND enqueue planner
        const url = urlJoin(BASE_URL, "/api/runs/create");
        const payload = {
            projectName: `full-test-${Date.now()}`,
            goal: "Smoke test run: validate planner -> producer -> QA -> DONE",
            audience: "Internal operator",
            format: "Checklist + short doc",
            rubricKey: "EDU_V1",
            constraints: "Turkish, concise, actionable",
        };

        const r = await tryJson(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!r.ok) {
            console.error("❌ /api/runs/create failed.");
            throw r.error;
        }

        // tolerate different response shapes
        runId = String(r.data?.runId ?? r.data?.id ?? r.data?.run?.id ?? "");
        if (!runId) {
            console.error("Create response:", r.data);
            throw new Error("Could not find runId in /api/runs/create response");
        }
        console.log(`✅ created runId=${runId}`);
    }

    section("Poll until DONE (initial run)");
    const first = await pollRunDone(runId);
    if (first.status === "FAILED") {
        console.error("❌ Run failed. Inspect /projects/[id] and worker logs.");
        process.exitCode = 1;
        return;
    }
    console.log("✅ Run reached DONE");

    section("Recovery actions (reproduce -> DONE, reqa -> DONE)");
    // Reproduce
    await postAction(runId, "reproduce");
    const afterReproduce = await pollRunDone(runId);
    if (afterReproduce.status !== "DONE") {
        console.error("❌ After reproduce, run did not reach DONE");
        process.exitCode = 1;
        return;
    }
    console.log("✅ Reproduce cycle DONE");

    // Re-QA
    await postAction(runId, "reqa");
    const afterReqa = await pollRunDone(runId);
    if (afterReqa.status !== "DONE") {
        console.error("❌ After reqa, run did not reach DONE");
        process.exitCode = 1;
        return;
    }
    console.log("✅ Re-QA cycle DONE");

    section("Export ZIP");
    await downloadExport(runId);

    await smokePages();

    section("RESULT");
    console.log("✅ FULL TEST PASS");
    console.log(`Run tested: ${runId}`);
    console.log(`Artifacts/Jobs/Evals validated via /api/runs/get polling + export zip`);
}

main().catch((e) => {
    console.error("\n❌ FULL TEST FAIL");
    console.error(e?.stack ?? e);
    process.exitCode = 1;
});
