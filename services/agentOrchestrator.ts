import { Storage } from '../storage';
import { QueueService } from './queue';
import { RunService } from './runService';
import { Run, TaskStatus } from '../types';

export class AgentOrchestrator {
    // Main Control Loop (called by UI interval)
    static async processRunLoop(projectId: string, phaseId: string) {
        // 1. Get Active Run (or create if Auto Mode needs one?)
        // For v0.8, we assume the user starts a Run via UI (Manual or Auto).
        // So we look for a Run that is NOT DONE/ERROR.
        const runs = Storage.getRuns(projectId, phaseId);
        const activeRun = runs.find(r => r.status !== 'DONE' && r.status !== 'ERROR');

        if (!activeRun) return; // Nothing to orchestrate

        console.log(`[Orchestrator] Run ${activeRun.id} is ${activeRun.status}`);

        switch (activeRun.status) {
            case 'PLANNING':
                await this.handlePlanning(activeRun);
                break;
            case 'PRODUCING':
                await this.handleProducing(activeRun);
                break;
            case 'QA':
                await this.handleQA(activeRun);
                break;
            case 'FIXING':
                // Optional for v0.8
                break;
        }
    }

    private static async handlePlanning(run: Run) {
        // Check if Plan Artifact exists for this run
        const artifacts = Storage.getArtifacts(run.projectId, run.phaseId);
        const plan = artifacts.find(a => a.format === 'md' && a.filename === 'PLAN.md'); // Simplified check

        if (plan) {
            // Plan exists, move to PRODUCING
            RunService.updateStatus(run.id, 'PRODUCING');
            // Generate Producer Jobs from Plan (Mock: just ensure queue has items)
            // Ideally we parse the plan. For MVP, we just enqueue default items if queue empty.
            if (QueueService.getQueue().length === 0) {
                QueueService.enqueue([
                    { index: 1, raw: "Cover Image", purpose: "poster", agent: 'PRODUCER', runId: run.id, projectId: run.projectId, phaseId: run.phaseId },
                    { index: 2, raw: "Section Header", purpose: "slide_background", agent: 'PRODUCER', runId: run.id, projectId: run.projectId, phaseId: run.phaseId },
                    { index: 3, raw: "Diagram", purpose: "worksheet_illustration", agent: 'PRODUCER', runId: run.id, projectId: run.projectId, phaseId: run.phaseId }
                ]);
            }
        } else {
            // No Plan, Enqueue Planner Job if not already pending
            const queue = QueueService.getQueue();
            const planningJob = queue.find(q => q.agent === 'PLANNER' && q.runId === run.id);
            if (!planningJob) {
                QueueService.enqueue([{
                    index: 0,
                    raw: "Create Implementation Plan",
                    agent: 'PLANNER',
                    runId: run.id,
                    projectId: run.projectId,
                    phaseId: run.phaseId
                }]);
            }
        }
    }

    private static async handleProducing(run: Run) {
        const queue = QueueService.getQueue();
        const myJobs = queue.filter(q => q.runId === run.id && q.agent === 'PRODUCER');

        // If no jobs left in queue and we have artifacts, move to QA
        const artifacts = Storage.getArtifacts(run.projectId, run.phaseId);
        // Better check: are all myJobs done?
        const activeJobs = myJobs.filter(q => q.status !== 'done' && q.status !== 'error');

        if (myJobs.length > 0 && activeJobs.length === 0) {
            // All producer jobs done. Move to QA.
            RunService.updateStatus(run.id, 'QA');
        }
    }

    private static async handleQA(run: Run) {
        // 1. Find artifacts needing QA
        const artifacts = Storage.getArtifacts(run.projectId, run.phaseId);
        const pendingQA = artifacts.filter(a => a.qaStatus === 'pending');

        if (pendingQA.length > 0) {
            // Enqueue QA Jobs
            const queue = QueueService.getQueue();
            const newQAJobs = [];
            for (const art of pendingQA) {
                const exists = queue.find(q => q.stepKey === art.id && q.agent === 'QA');
                if (!exists) {
                    newQAJobs.push({
                        index: 0,
                        raw: `Evaluate ${art.filename}`,
                        agent: 'QA' as const,
                        runId: run.id,
                        projectId: run.projectId,
                        phaseId: run.phaseId,
                        stepKey: art.id // Link job to artifact
                    });
                }
            }
            if (newQAJobs.length > 0) QueueService.enqueue(newQAJobs);
        } else {
            // All QA Done?
            // If all artifacts have status pass/fail, finish run.
            const allEvaluated = artifacts.every(a => a.qaStatus !== 'pending');
            if (allEvaluated) {
                RunService.updateStatus(run.id, 'DONE');

                // Update Phase Status depending on DoD
                const hasPass = artifacts.some(a => a.qaStatus === 'pass');
                if (hasPass) {
                    // Start celebration?
                }
            }
        }
    }
}
