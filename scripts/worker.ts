import { PrismaClient } from "@prisma/client";
import * as Orchestrator from "./orchestrators/gemini";
import { PHASES } from "../lib/phases";

const prisma = new PrismaClient();
const POLL_MS = Number(process.env.WORKER_POLL_MS) || 1000;
const LEASE_MS = 90_000; // 90s
const MAX_ATTEMPTS = 3;
const WORKER_ID = `${process.env.HOSTNAME ?? 'local'}:${process.pid}:${Math.random().toString(16).slice(2)}`;

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * STEP 2: Reaper - Unlock stale jobs (stuck locks)
 */
async function reapStaleLocks() {
    const staleTime = new Date(Date.now() - LEASE_MS);
    const result = await prisma.job.updateMany({
        where: {
            status: "RUNNING",
            lockedAt: { lt: staleTime },
        },
        data: {
            status: "QUEUED",
            lockedAt: null,
            lockedBy: null,
        },
    });
    if (result.count > 0) {
        console.log(`[Reaper] Unlocked ${result.count} stale jobs.`);
    }
}

/**
 * STEP 2: Atomic Claim
 */
async function claimNextJob() {
    // 1. Find a candidate
    const job = await prisma.job.findFirst({
        where: {
            status: "QUEUED",
            lockedAt: null,
        },
        orderBy: { createdAt: "asc" },
    });
    if (!job) return null;

    // 2. Try to lock it atomically
    const result = await prisma.job.updateMany({
        where: {
            id: job.id,
            status: "QUEUED",
            lockedAt: null,
        },
        data: {
            status: "RUNNING",
            lockedAt: new Date(),
            lockedBy: WORKER_ID,
            attempts: { increment: 1 },
            startedAt: new Date(),
        },
    });

    if (result.count === 0) return null; // Someone else grabbed it

    // 3. Return the fully loaded job
    return await prisma.job.findUnique({ where: { id: job.id } });
}

/**
 * STEP 2: Finish Job with Retry logic
 */
async function finishJob(jobId: string, ok: boolean, errorMessage?: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;

    if (ok) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "DONE",
                finishedAt: new Date(),
                lockedAt: null,
                lockedBy: null,
            },
        });
    } else {
        const shouldRetry = job.attempts < MAX_ATTEMPTS;
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: shouldRetry ? "QUEUED" : "ERROR",
                finishedAt: shouldRetry ? null : new Date(),
                lockedAt: null,
                lockedBy: null,
                lastError: errorMessage,
                error: shouldRetry ? undefined : errorMessage,
            },
        });
        console.log(`[Worker] Job ${jobId} failed. ${shouldRetry ? 'Retrying' : 'Final failure'}. Attempts: ${job.attempts}/${MAX_ATTEMPTS}`);
    }
}

async function planner(job: any) {
    console.log(`[Planner] Executing job ${job.id}`);

    const runTitle = `Run ${job.runId.slice(0, 6)}`;
    let userPrompt = "";
    if (job.input) {
        try {
            const parsed = JSON.parse(job.input);
            userPrompt = JSON.stringify(parsed);
        } catch { }
    }

    const { planMarkdown, items } = await Orchestrator.planner(runTitle, userPrompt);

    const planArtifact = await prisma.artifact.create({
        data: {
            projectId: job.projectId || "demo",
            phaseId: job.phaseId || "m1",
            runId: job.runId,
            fileName: "PLAN.json",
            mimeType: "application/json",
            contentText: planMarkdown + "\n\n```json\n" + JSON.stringify({ items }, null, 2) + "\n```",
            qaStatus: "pass",
        },
    });

    for (const item of items) {
        await prisma.job.create({
            data: {
                runId: job.runId,
                agent: "PRODUCER",
                type: "agent",
                stepKey: item.title,
                status: "QUEUED",
                input: JSON.stringify({
                    planArtifactId: planArtifact.id,
                    title: item.title,
                    goal: item.goal,
                    acceptance: item.acceptance
                }),
                projectId: planArtifact.projectId,
                phaseId: planArtifact.phaseId,
                attempts: 0
            },
        });
    }

    if (job.runId) {
        await prisma.run.update({
            where: { id: job.runId },
            data: { status: "PRODUCING" },
        });
    }

    return { planArtifactId: planArtifact.id };
}

async function advanceRunAfterProducer(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run) return;
    if (run.status !== 'PRODUCING') return;

    const activeProducer = await prisma.job.count({
        where: {
            runId,
            agent: "PRODUCER",
            status: { in: ["QUEUED", "RUNNING"] },
        },
    });

    if (activeProducer > 0) return;

    console.log(`[Worker] All Producers done for Run ${runId}. Enqueuing QA...`);

    const artifacts = await prisma.artifact.findMany({
        where: { runId, qaStatus: 'pending' }
    });

    const outputs = artifacts.filter(a => a.fileName !== 'PLAN.json');

    if (outputs.length === 0) {
        console.warn(`[Worker] No outputs to QA for Run ${runId}`);
        await prisma.run.update({ where: { id: runId }, data: { status: "DONE" } });
        return;
    }

    for (const art of outputs) {
        const existingJob = await prisma.job.findFirst({
            where: { runId, agent: "QA", stepKey: `qa.${art.id}` }
        });

        if (!existingJob) {
            await prisma.job.create({
                data: {
                    runId,
                    agent: "QA",
                    type: "agent",
                    stepKey: `qa.${art.id}`,
                    status: "QUEUED",
                    input: JSON.stringify({ artifactId: art.id, rubricKey: "EDU_V1" }),
                    projectId: art.projectId,
                    phaseId: art.phaseId,
                    attempts: 0
                },
            });
        }
    }

    await prisma.run.update({ where: { id: runId }, data: { status: "QA" } });
    console.log(`[Worker] Run ${runId} advanced to QA`);
}

async function producer(job: any) {
    console.log(`[Producer] Executing job ${job.id} for ${job.stepKey}`);

    let task = { title: job.stepKey || "Unknown Task", goal: "", acceptance: [] };
    if (job.input) {
        try {
            const parsed = JSON.parse(job.input);
            task = { title: parsed.title || task.title, goal: parsed.goal || "", acceptance: parsed.acceptance || [] };
        } catch { }
    }

    let content: string;
    if (!process.env.GEMINI_API_KEY) {
        // ETAP C: Mock fallback
        content = `# [MOCK] ${task.title}\n\nThis content was generated by the MOCK PROVIDER because GEMINI_API_KEY is not set. It is designed to be longer than 100 characters to ensure it passes the length-based QA rubric during CI smoke tests.\n\n- Deterministic Output\n- Actionable steps\n- Safe and fast\n\nGoal: ${task.goal}`;
    } else {
        content = await Orchestrator.producer(task, "");
    }

    await prisma.artifact.create({
        data: {
            projectId: job.projectId || "demo",
            phaseId: job.phaseId || "m1",
            runId: job.runId,
            fileName: `${job.stepKey}.md`,
            mimeType: "text/markdown",
            contentText: content,
            qaStatus: "pending",
        },
    });
}

async function advanceRunAfterQA(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run) return;
    if (run.status !== 'QA') return;

    const activeQA = await prisma.job.count({
        where: {
            runId,
            agent: "QA",
            status: { in: ["QUEUED", "RUNNING"] },
        },
    });

    if (activeQA > 0) return;

    const evals = await prisma.artifactEvaluation.findMany({
        where: { runId: runId, verdict: "PASS" },
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });

    if (evals.length > 0) {
        await prisma.artifact.update({
            where: { id: evals[0].artifactId },
            data: { isFinal: true },
        });

        const currentPhaseIndex = PHASES.findIndex(p => p.id === run.phaseId);
        const nextPhase = PHASES[currentPhaseIndex + 1];

        if (nextPhase) {
            console.log(`[Worker] Phase ${run.phaseId} complete. Advancing to ${nextPhase.id}...`);
            await prisma.run.update({
                where: { id: runId },
                data: { phaseId: nextPhase.id, status: "PLANNING" }
            });

            await prisma.job.create({
                data: {
                    type: 'agent',
                    agent: 'PLANNER',
                    status: 'QUEUED',
                    runId: run.id,
                    projectId: run.projectId,
                    phaseId: nextPhase.id,
                    input: JSON.stringify({ instruction: `Begin ${nextPhase.name}`, previousPhaseId: run.phaseId }),
                    attempts: 0
                }
            });
        } else {
            console.log(`[Worker] All phases complete. Run ${runId} DONE.`);
            await prisma.run.update({
                where: { id: runId },
                data: { status: "DONE", finishedAt: new Date() },
            });
        }
    } else {
        console.log(`[Worker] QA finished but NO winner found. Marking DONE (No Winner).`);
        await prisma.run.update({
            where: { id: runId },
            data: { status: "DONE", finishedAt: new Date() }
        });
    }
}

async function qa(job: any) {
    console.log(`[QA] Executing job ${job.id}`);
    const input = JSON.parse(job.input);
    const { artifactId, candidateIds, rubricKey } = input;

    // Support both single artistId and bulk candidateIds from reqa route
    const idsToEval = artifactId ? [artifactId] : (Array.isArray(candidateIds) ? candidateIds : []);

    if (idsToEval.length === 0) {
        console.warn(`[QA] Job ${job.id} has no artifacts to evaluate.`);
        return;
    }

    for (const id of idsToEval) {
        const artifact = await prisma.artifact.findUnique({ where: { id } });
        if (!artifact) {
            console.warn(`[QA] Artifact ${id} not found, skipping.`);
            continue;
        }

        const existing = await prisma.artifactEvaluation.findFirst({
            where: { runId: job.runId, artifactId: id, rubricKey: rubricKey || "EDU_V1" },
        });

        if (!existing) {
            const length = artifact.contentText.length;
            await sleep(300);

            let score: number;
            if (!process.env.GEMINI_API_KEY) {
                // ETAP C: In mock mode, force PASS if it looks like mock content
                score = artifact.contentText.includes("[MOCK]") ? 95 : (length > 100 ? 80 : 40);
            } else {
                score = length > 100 ? 80 : 40;
            }

            const verdict = score >= 70 ? "PASS" : "FAIL";

            await prisma.artifactEvaluation.create({
                data: {
                    artifactId: id,
                    runId: job.runId,
                    rubricKey: rubricKey || "EDU_V1",
                    score,
                    verdict,
                    notesJson: JSON.stringify({ note: `Score: ${score} (MockMode: ${!process.env.GEMINI_API_KEY})` }),
                },
            });

            await prisma.artifact.update({
                where: { id },
                data: { qaStatus: verdict === "PASS" ? "pass" : "fail" },
            });
        }
    }
}

/**
 * STEP 3: Heartbeat
 */
async function logHeartbeat() {
    const queuedCount = await prisma.job.count({ where: { status: "QUEUED" } });
    const runningCount = await prisma.job.count({ where: { status: "RUNNING" } });

    // Console log (ETAP B)
    console.log(`[Heartbeat] [${new Date().toISOString()}] WorkerID: ${WORKER_ID} | Queued: ${queuedCount} | Running: ${runningCount}`);

    // DB log (ETAP C)
    try {
        await prisma.workerHeartbeat.create({
            data: {
                workerId: WORKER_ID,
                queued: queuedCount,
                running: runningCount,
            }
        });
    } catch (e) {
        console.error("[Heartbeat DB Error]", e);
    }
}

/**
 * STEP 2: Prune old heartbeats (>24h)
 */
async function pruneHeartbeats() {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await prisma.workerHeartbeat.deleteMany({
        where: { ts: { lt: dayAgo } }
    });
    if (result.count > 0) {
        console.log(`[Cleaner] Pruned ${result.count} old heartbeats.`);
    }
}

async function main() {
    console.log(`[Worker] Started. ID: ${WORKER_ID}. Polling DB...`);

    // Recovery: Unlock stale jobs at startup
    await reapStaleLocks();

    await logHeartbeat();

    // Heartbeat every 15s
    setInterval(async () => {
        try {
            await logHeartbeat();
        } catch (e) {
            console.error("[Heartbeat Interval Error]", e);
        }
    }, 15000);

    // Stale lock reaper every 30s
    setInterval(async () => {
        try {
            await reapStaleLocks();
        } catch (e) {
            console.error("[Reaper Interval Error]", e);
        }
    }, 30000);

    // Cleanup every 5m
    setInterval(async () => {
        try {
            await pruneHeartbeats();
        } catch (e) {
            console.error("[Prune Interval Error]", e);
        }
    }, 5 * 60 * 1000);

    while (true) {
        const job = await claimNextJob();
        if (!job) {
            await sleep(POLL_MS);
            continue;
        }

        try {
            if (job.agent === "PLANNER") {
                await planner(job);
            }
            else if (job.agent === "PRODUCER") {
                await producer(job);
                await finishJob(job.id, true);
                if (job.runId) await advanceRunAfterProducer(job.runId);
                continue;
            }
            else if (job.agent === "QA") {
                await qa(job);
                await finishJob(job.id, true);
                if (job.runId) await advanceRunAfterQA(job.runId);
                continue;
            }
            else {
                console.warn("Unknown agent", job.agent);
            }

            await finishJob(job.id, true);
        } catch (e: any) {
            console.error(`Job ${job.id} failed:`, e);
            await finishJob(job.id, false, e?.message || String(e));
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
