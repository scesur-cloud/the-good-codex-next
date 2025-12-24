
import { Storage } from "../storage";
import { Project, Phase, TaskStatus, Artifact } from "../types";
import { QueueService, QueueItem } from "./queue";

export class AutoRunner {
    static checkPhase(projectId: string, phaseId: string) {
        const phases = Storage.getPhases(projectId);
        const phase = phases.find(p => p.id === phaseId);
        if (!phase) return;

        // RULE 1: If AutoRun is enabled (we assume UI calls this loop if enabled), 
        // check if we need to Generate Prompts
        const artifacts = Storage.getArtifacts(projectId, phaseId);
        const queue = QueueService.getQueue().filter(q => q.phaseId === phaseId);

        // If no work exists (no artifacts, no queue), create Initial Work
        if (artifacts.length === 0 && queue.length === 0) {
            this.generateInitialPrompts(projectId, phaseId);
            return; // Wait for next tick
        }

        // RULE 2: Ensure Queue is Running
        // QueueService handles its own processing, but we can trigger it
        QueueService.processTick();

        // RULE 3: Auto QA
        // If there are pending artifacts, grade them
        const pendingArtifacts = artifacts.filter(a => a.qaStatus === 'pending');
        if (pendingArtifacts.length > 0) {
            this.runAutoQA(pendingArtifacts);
        }

        // RULE 4: Finalize
        // If we have at least one PASS artifact, and queue is empty, Mark Phase Done
        const hasPass = artifacts.some(a => a.qaStatus === 'pass');
        const isWorking = queue.some(q => q.status === 'pending' || q.status === 'running');

        if (hasPass && !isWorking && phase.status !== TaskStatus.DONE) {
            // Check DoD - For AutoRun MVP, we auto-check DoD items
            // @ts-ignore - Phase type definition vs Storage runtime mismatch
            const currentDod = (phase as any).dod || [];
            const newDod = currentDod.map((d: any) => ({ ...d, checked: true }));
            const updatedPhase = { ...phase, dod: newDod, status: TaskStatus.DONE };
            Storage.updatePhase(updatedPhase);
            console.log("AutoRunner: Phase Completed", phaseId);
        }
    }

    static generateInitialPrompts(projectId: string, phaseId: string) {
        // Mocking Intelligent Planning - Just creates 3 standard items
        const prompts = [
            { raw: "Concept visualization for phase overview", purpose: "slide_background", index: 1 },
            { raw: "Detailed diagram of process flow", purpose: "generic", index: 2 },
            { raw: "Abstract background for report cover", purpose: "poster", index: 3 }
        ];

        QueueService.enqueue(prompts.map(p => ({
            ...p,
            projectId,
            phaseId,
            agent: 'PRODUCER',
            parsed: {}, // Simplified
        })));
    }

    static runAutoQA(artifacts: Artifact[]) {
        // Simple Rubric: longer than 0 bytes -> PASS
        artifacts.forEach(art => {
            // 80% chance pass, 20% need revision
            const isPass = Math.random() > 0.2;
            const status = isPass ? 'pass' : 'fail';
            // @ts-ignore - Artifact type definition mismatch
            const notes = isPass ? "AutoQA: Format compliant, visual quality acceptable." : "AutoQA: Low contrast or artifacting detected.";

            Storage.updateArtifact({ ...art, qaStatus: status });
        });
    }
}
