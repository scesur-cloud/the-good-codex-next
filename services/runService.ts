import { RunGetResponse } from '../types';

export class RunService {
    static async createRun(projectId: string, phaseId: string, mode: 'MANUAL' | 'AUTO'): Promise<any> {
        const res = await fetch('/api/runs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, phaseId, mode })
        });
        return await res.json();
    }

    static async startRun(runId: string): Promise<void> {
        await fetch('/api/runs/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ runId })
        });
    }

    static async updateStatus(runId: string, status: string): Promise<void> {
        // Stub for v0.8 / CI pass
        console.log(`[RunService] Stub updateStatus: ${runId} -> ${status}`);
    }

    static async getRun(runId: string): Promise<RunGetResponse | null> {
        try {
            const res = await fetch(`/api/runs/get?runId=${encodeURIComponent(runId)}`, { cache: 'no-store' });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static async getLastRun(projectId: string, phaseId: string): Promise<RunGetResponse> {
        try {
            const res = await fetch(`/api/runs/get?projectId=${projectId}&phaseId=${phaseId}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json();
        } catch (e) {
            console.error(e);
            return {
                run: null,
                stats: {
                    PLANNER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    PRODUCER: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    QA: { pending: 0, inFlight: 0, done: 0, failed: 0 },
                    FIXER: { pending: 0, inFlight: 0, done: 0, failed: 0 }
                }
            };
        }
    }
}
