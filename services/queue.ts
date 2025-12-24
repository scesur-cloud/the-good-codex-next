
import { ParsedPromptItem } from "../multiPromptParser";
import { Storage } from "../storage";
import { Artifact } from "../types";
import { GoogleGenAI } from "@google/genai";

export type QueueItem = ParsedPromptItem & {
    id: string;
    projectId: string;
    phaseId: string;
    // v0.8 Agent Fields
    agent: 'PLANNER' | 'PRODUCER' | 'QA' | 'FIXER';
    runId?: string;
    stepKey?: string; // e.g. "plan.v1" or "verify.art.123"

    status: "pending" | "running" | "done" | "error";
    error?: string;

    // Result payload (can be image or text/json)
    outputData?: string;
    imageDataUrl?: string; // Legacy support or specific for Producer
};

export interface QueueStats {
    pending: number;
    inFlight: number;
    completed: number;
}

export class QueueService {
    private static STORAGE_KEY = 'codex_queue_v1';
    private static CONFIG_KEY = 'codex_queue_config';

    static getQueue(): QueueItem[] {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    static saveQueue(queue: QueueItem[]) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
        // Trigger an event so components can react
        window.dispatchEvent(new Event('queue_updated'));
    }

    static getConfig() {
        const raw = localStorage.getItem(this.CONFIG_KEY);
        return raw ? JSON.parse(raw) : { paused: false, concurrency: 1 };
    }

    static setConfig(config: { paused: boolean; concurrency: number }) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
        window.dispatchEvent(new Event('queue_updated')); // Re-trigger processing check
    }

    static enqueue(items: Omit<QueueItem, 'id' | 'status'>[]) {
        const current = this.getQueue();
        const newItems = items.map(item => ({
            ...item,
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: "pending" as const
        }));
        this.saveQueue([...current, ...newItems]);
    }

    static retryAllFailed() {
        const current = this.getQueue();
        const needsRetry = current.map(item => item.status === 'error' ? { ...item, status: 'pending', error: undefined } : item);
        // @ts-ignore
        this.saveQueue(needsRetry);
    }

    static clearCompleted() {
        const current = this.getQueue();
        this.saveQueue(current.filter(i => i.status !== 'done'));
    }

    // The "Worker" Tick
    static async processTick() {
        const config = this.getConfig();
        if (config.paused) return;

        const queue = this.getQueue();
        const inFlight = queue.filter(i => i.status === 'running');

        if (inFlight.length >= config.concurrency) return;

        const nextItem = queue.find(i => i.status === 'pending');
        if (!nextItem) return;

        // Mark as running
        nextItem.status = 'running';
        this.saveQueue(queue); // Save state "Running"

        // Execute Job (Async but don't await blocking the main thread totally, though JS is single threaded)
        // In a real worker, this would be off-thread. Here we just trigger the promise.
        this.executeJob(nextItem).then(result => {
            // Reload fresh queue to avoid stale overwrites
            const freshQueue = this.getQueue();
            const target = freshQueue.find(i => i.id === nextItem.id);
            if (target) {
                if (result.success) {
                    target.status = 'done';
                    target.outputData = result.data;

                    // Handle Artifact Creation based on Agent
                    if (target.agent === 'PRODUCER') {
                        target.imageDataUrl = result.data;
                        const artifact: Artifact = {
                            id: `art_${Date.now()}`,
                            projectId: nextItem.projectId,
                            phaseId: nextItem.phaseId,
                            version: 1,
                            filename: `gen_${nextItem.index}.png`,
                            format: 'png',
                            content: result.data || '',
                            createdAt: Date.now(),
                            qaStatus: 'pending'
                        };
                        Storage.saveArtifact(artifact);
                    } else if (target.agent === 'PLANNER') {
                        // Save Plan Artifact
                        const artifact: Artifact = {
                            id: `plan_${Date.now()}`,
                            projectId: nextItem.projectId,
                            phaseId: nextItem.phaseId,
                            version: 1,
                            filename: `PLAN.md`,
                            format: 'md',
                            content: result.data || '',
                            createdAt: Date.now(),
                            qaStatus: 'pending'
                        };
                        Storage.saveArtifact(artifact);
                    } else if (target.agent === 'QA') {
                        // Parse Evaluation and Save
                        try {
                            const evalData = JSON.parse(result.data || '{}');
                            // Find target artifact from stepKey if possible, or context
                            // For v0.8 MVP we assume stepKey holds artifactId for QA jobs
                            if (target.stepKey) { // artifactId
                                Storage.saveEvaluation({
                                    id: `eval_${Date.now()}`,
                                    artifactId: target.stepKey,
                                    runId: target.runId || 'manual',
                                    rubricKey: 'GENERIC_V1',
                                    verdict: evalData.verdict,
                                    score: evalData.score,
                                    notesJson: JSON.stringify(evalData.notes),
                                    createdAt: new Date()
                                });
                                // Update Artifact Status
                                const artifacts = Storage.getArtifacts(target.projectId, target.phaseId);
                                const art = artifacts.find(a => a.id === target.stepKey);
                                if (art) {
                                    art.qaStatus = evalData.verdict === 'PASS' ? 'pass' : 'fail';
                                    Storage.updateArtifact(art);
                                }
                            }
                        } catch (e) {
                            console.error("QA Parse Error", e);
                        }
                    }

                } else {
                    target.status = 'error';
                    target.error = result.error;
                }
                this.saveQueue(freshQueue);
                // Trigger next tick immediately
                this.processTick();
            }
        });

        // Try to start another if concurrency allows
        this.processTick();
    }

    private static async executeJob(item: QueueItem): Promise<{ success: boolean, data?: string, error?: string }> {
        const apiKey = process.env.GEMINI_API_KEY;
        // Planner and QA can run without API key in "Simulated Mode" if needed, but optimally we use Real AI.
        // For v0.8 MVP, let's allow simulated agents if key is missing, to unblock UI dev.

        switch (item.agent) {
            case 'PLANNER':
                return this.executePlanner(item, apiKey);
            case 'QA':
                return this.executeQA(item, apiKey);
            case 'PRODUCER':
            default:
                if (!apiKey) return { success: false, error: "API Key Missing" };
                return this.executeProducer(item, apiKey);
        }
    }

    private static async executePlanner(item: QueueItem, apiKey?: string) {
        // v0.8: If no API key, return mock plan
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 2000));
            return {
                success: true,
                data: `\n# Plan for ${item.phaseId}\n**Generated by Agent Planner**\n\n1. [ ] Analyze Requirements\n2. [ ] Generate Assets\n3. [ ] Verify Quality`
            };
        }
        // Real AI Call for Plan
        // TODO: Implement actual Planner Prompt
        return { success: true, data: "Real AI Plan Not Implemented Yet" };
    }

    private static async executeQA(item: QueueItem, apiKey?: string) {
        // v0.8: Mock QA
        await new Promise(r => setTimeout(r, 1500));
        // Random Pass/Fail for demo
        const isPass = Math.random() > 0.3;
        const verdict = isPass ? 'PASS' : 'FAIL';
        const score = isPass ? 85 : 45;
        const evaluation = {
            verdict,
            score,
            notes: isPass ? "Meets all criteria." : "Poor composition."
        };
        return { success: true, data: JSON.stringify(evaluation) };
    }

    private static async executeProducer(item: QueueItem, apiKey: string) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            const purpose = item.purpose || "generic";
            const style = "High quality, professional";
            const prompt = `Style: ${style}. Purpose: ${purpose}. User Request: ${item.raw}.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { parts: [{ text: prompt }] },
            });

            let base64Data = "";
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Data = part.inlineData.data || "";
                        break;
                    }
                }
            }

            if (!base64Data) throw new Error("No image data returned from provider");
            return { success: true, data: base64Data };

        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    }

    static getStats(): QueueStats {
        const queue = this.getQueue();
        return {
            pending: queue.filter(i => i.status === 'pending').length,
            inFlight: queue.filter(i => i.status === 'running').length,
            completed: queue.filter(i => i.status === 'done').length
        };
    }
}
