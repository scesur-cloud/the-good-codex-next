import { PrismaClient } from "@prisma/client";
import * as Orchestrator from "./orchestrators/gemini";

const prisma = new PrismaClient();
const POLL_MS = Number(process.env.WORKER_POLL_MS) || 1000;

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

async function claimNextJob() {
    const job = await prisma.job.findFirst({
        where: { status: { in: ["QUEUED", "pending"] } }, // Support both for safety during migration
        orderBy: { createdAt: "asc" },
    });
    if (!job) return null;

    const claimed = await prisma.job.update({
        where: { id: job.id },
        data: { status: "RUNNING", startedAt: new Date() },
    });

    return claimed;
}

async function finishJob(jobId: string, ok: boolean, errorMessage?: string) {
    await prisma.job.update({
        where: { id: jobId },
        data: ok
            ? ({ status: "DONE", finishedAt: new Date() })
            : ({ status: "ERROR", finishedAt: new Date(), error: errorMessage }),
    });
}

async function planner(job: any) {
    console.log(`[Planner] Executing job ${job.id}`);

    // Real LLM Generation
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
            projectId: job.projectId || (job.input ? JSON.parse(job.input).projectId : "demo"),
            phaseId: job.phaseId || (job.input ? JSON.parse(job.input).phaseId : "m1"),
            runId: job.runId,
            fileName: "PLAN.json",
            mimeType: "application/json",
            contentText: planMarkdown + "\n\n```json\n" + JSON.stringify({ items }, null, 2) + "\n```", // Store full context
            qaStatus: "pass",
        },
    });

    // Enqueue PRODUCER jobs
    for (const item of items) {
        await prisma.job.create({
            data: {
                runId: job.runId,
                agent: "PRODUCER",
                type: "agent",
                stepKey: item.title,
                status: "QUEUED",
                // Pass task details in payload
                input: JSON.stringify({
                    planArtifactId: planArtifact.id,
                    title: item.title,
                    goal: item.goal,
                    acceptance: item.acceptance
                }),
                projectId: planArtifact.projectId,
                phaseId: planArtifact.phaseId
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


// Idempotent Advance for Producer phase
async function advanceRunAfterProducer(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run) return;
    // If not in PRODUCING or active, ignore
    if (run.status !== 'PRODUCING') return;

    // Check for active Producer jobs
    const activeProducer = await prisma.job.count({
        where: {
            runId,
            agent: "PRODUCER",
            status: { in: ["QUEUED", "RUNNING", "pending", "running"] },
        },
    });

    if (activeProducer > 0) return;

    console.log(`[Worker] All Producers done for Run ${runId}. Enqueuing QA...`);

    // Fetch Outputs
    const artifacts = await prisma.artifact.findMany({
        where: { runId, qaStatus: 'pending' } // Only pending ones or all? ideally all outputs
    });

    // Filter strictly for OUTPUT kind or exclusion of PLAN
    const outputs = artifacts.filter(a => a.fileName !== 'PLAN.json');

    if (outputs.length === 0) {
        // Edge case: No outputs produced? Just go to DONE or ERROR?
        // For now, let's go to QA (Run Status) and let QA logic handle empty?
        // Or if really 0, just finish.
        console.warn(`[Worker] No outputs to QA for Run ${runId}`);
        await prisma.run.update({ where: { id: runId }, data: { status: "DONE" } }); // Fast track
        return;
    }

    // Enqueue QA Jobs (Idempotent check inside QA handler, but here we just blindly create if not exists?)
    // Better: Check if QA job exists for this artifact
    for (const art of outputs) {
        const existingJob = await prisma.job.findFirst({
            where: {
                runId,
                agent: "QA",
                stepKey: `qa.${art.id}`
            }
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
                    phaseId: art.phaseId
                },
            });
        }
    }

    // Advance Run Status
    await prisma.run.update({ where: { id: runId }, data: { status: "QA" } });
    console.log(`[Worker] Run ${runId} advanced to QA`);
}

async function producer(job: any) {
    console.log(`[Producer] Executing job ${job.id} for ${job.stepKey}`);

    // Parse payload
    let task = { title: job.stepKey || "Unknown Task", goal: "", acceptance: [] };
    let userPrompt = "";
    if (job.input) {
        try {
            const parsed = JSON.parse(job.input);
            task = {
                title: parsed.title || task.title,
                goal: parsed.goal || "",
                acceptance: parsed.acceptance || []
            };
        } catch { }
    }

    // Ensure we don't duplicate generation if job retries but artifact exists?
    // For now simple: always generate.

    // Call Orchestrator (Stub or Gemini)
    const content = await Orchestrator.producer(task, userPrompt);

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

    // Mark current job done so advance check sees it as done
    // Note: We'll mark it done in main loop, but we need it 'done' for the count check.
    // So we invoke the check AFTER updates.
    // To be safe, we return artifactId here, and let main loop update status.
    // BUT advanceRun check needs DB state. 
    // So we'll run advanceRun AFTER the main loop updates status. 
    // OR we proactively update status here? 
    // Let's stick to the user's plan: 
    // "1) Producer handler’ın en sonuna bunu ekle... await advanceRunAfterProducer(run.id);"
    // BUT we need to mark THIS job as done first in DB otherwise count > 0.

    // Hack: We update this job to 'done' explicitly here to satisfy the check
    await prisma.job.update({ where: { id: job.id }, data: { status: "DONE", finishedAt: new Date() } });

    // NOW check advancement
    if (job.runId) {
        await advanceRunAfterProducer(job.runId);
    }

    return { artifactId: 'created' }; // We manually finished, so main loop might try to finish again?
    // We should treat main loop carefully.
}


import { PHASES } from "../lib/phases";

// ...

// Idempotent Advance for QA phase
async function advanceRunAfterQA(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run) return;
    if (run.status !== 'QA') return;

    // Check for active QA jobs
    const activeQA = await prisma.job.count({
        where: {
            runId,
            agent: "QA",
            status: { in: ["QUEUED", "RUNNING", "pending", "running"] },
        },
    });

    if (activeQA > 0) return;

    // Check if we have a winner (PASS)
    const evals = await prisma.artifactEvaluation.findMany({
        where: { runId: runId, verdict: "PASS" },
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });

    if (evals.length > 0) {
        // Winner found! Mark final for this phase
        await prisma.artifact.update({
            where: { id: evals[0].artifactId },
            data: { isFinal: true },
        });

        // --- Multi-phase Advancement Logic ---
        const currentPhaseIndex = PHASES.findIndex(p => p.id === run.phaseId);
        const nextPhase = PHASES[currentPhaseIndex + 1];

        if (nextPhase) {
            console.log(`[Worker] Phase ${run.phaseId} complete. Advancing to ${nextPhase.id}...`);

            // Advance Phase
            await prisma.run.update({
                where: { id: runId },
                data: {
                    phaseId: nextPhase.id,
                    status: "PLANNING" // Reset to Planning for next phase
                }
            });

            // Enqueue PLANNER for next phase
            await prisma.job.create({
                data: {
                    type: 'agent',
                    agent: 'PLANNER',
                    status: 'QUEUED',
                    runId: run.id,
                    projectId: run.projectId,
                    phaseId: nextPhase.id,
                    input: JSON.stringify({
                        instruction: `Begin ${nextPhase.name}`,
                        previousPhaseId: run.phaseId
                    })
                }
            });
            console.log(`[Worker] Started ${nextPhase.name}`);
        } else {
            // No next phase, actually DONE
            console.log(`[Worker] All phases complete. Run ${runId} DONE.`);
            await prisma.run.update({
                where: { id: runId },
                data: { status: "DONE", finishedAt: new Date() },
            });
        }

    } else {
        // No winner in QA?
        // Logic: Should we fail or just mark DONE (No Winner)?
        // Existing logic was just DONE. v0.9.4 keeps "No Winner" state which allows "Reproduce".
        // So we allow it to go to DONE (or stay in QA? No, jobs are done).
        // Let's mark as DONE so the UI shows "No Winner" actions.
        console.log(`[Worker] QA finished but NO winner found. Marking DONE (No Winner) to allow user recovery.`);
        await prisma.run.update({
            where: { id: runId },
            data: { status: "DONE", finishedAt: new Date() }
        });
    }
}


async function qa(job: any) {
    console.log(`[QA] Executing job ${job.id}`);
    const input = JSON.parse(job.input);
    const { artifactId, rubricKey } = input;

    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) throw new Error("Artifact not found");


    // Idempotency: Fail fast if already evaluated
    const existing = await prisma.artifactEvaluation.findFirst({
        where: { runId: job.runId, artifactId, rubricKey: rubricKey || "EDU_V1" },
    });

    if (existing) {
        console.log(`[QA] Skipping ${job.id}, already evaluated.`);
        // Mark explicit done here for safety? no, main loop does it.
        // But we should check advancement even if skipped.

        // Using setImmediate or just confirming update in loop
        // We'll return skipped: true.
        // Important: If we skip, we must STILL check advanceRunAfterQA!
    } else {
        // Deterministic Scoring (EDU_V1)
        const length = artifact.contentText.length;
        await sleep(300);
        const score = length > 100 ? 80 : 40;
        const verdict = score >= 70 ? "PASS" : "FAIL";

        await prisma.artifactEvaluation.create({
            data: {
                artifactId,
                runId: job.runId,
                rubricKey: rubricKey || "EDU_V1",
                score,
                verdict,
                notesJson: JSON.stringify({ note: `Length based score: ${length} chars` }),
            },
        });

        await prisma.artifact.update({
            where: { id: artifactId },
            data: { qaStatus: verdict === "PASS" ? "pass" : "fail" },
        });
    }

    // Mark current job done to satisfy count
    await prisma.job.update({ where: { id: job.id }, data: { status: "DONE", finishedAt: new Date() } });

    // Check Completion
    if (job.runId) {
        await advanceRunAfterQA(job.runId);
    }

    return { verdict: 'check_logs', score: 0 };
}

async function main() {
    console.log("[Worker] Started (Gemini Orchestrator). Polling DB...");
    while (true) {
        const job = await claimNextJob();
        if (!job) {
            await sleep(POLL_MS);
            continue;
        }

        try {
            if (job.agent === "PLANNER") await planner(job);
            else if (job.agent === "PRODUCER") {
                const res = await producer(job);
                // Producer function manages its own completion for synchronization
                if (res && res.artifactId === 'created') {
                    // Status already updated to done
                    continue;
                }
            }
            else if (job.agent === "QA") {
                const res = await qa(job);
                if (res) continue; // QA function marks job done and advances run
            }
            else {
                console.warn("Unknown agent", job.agent);
            }

            // Default finish for others
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
