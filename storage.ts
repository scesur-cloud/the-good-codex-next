
import { Project, Phase, Artifact, Notification, Role, Run, ArtifactEvaluation } from './types';
import { SEED_ROLES } from './seed_roles';

const KEYS = {
    PROJECTS: 'godcodex_projects_v1',
    PHASES: 'godcodex_phases_v1',
    ARTIFACTS: 'godcodex_artifacts_v1',
    NOTIFICATIONS: 'godcodex_notifications_v1',
    ROLES: 'godcodex_roles_v1',
    RUNS: 'godcodex_runs_v1',
    EVALUATIONS: 'godcodex_evaluations_v1'
};

export const Storage = {
    // Roles
    getRoles: (): Role[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];

        const roles = localStorage.getItem(KEYS.ROLES);
        if (!roles) return Storage.seedRolesIfEmpty();
        return JSON.parse(roles);
    },
    seedRolesIfEmpty: (): Role[] => {
        if (typeof window === 'undefined') return SEED_ROLES;
        if (typeof localStorage === 'undefined') return SEED_ROLES;
        localStorage.setItem(KEYS.ROLES, JSON.stringify(SEED_ROLES));
        return SEED_ROLES;
    },
    saveRoles: (roles: Role[]) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(KEYS.ROLES, JSON.stringify(roles));
    },
    addRole: (role: Role) => {
        const roles = Storage.getRoles();
        Storage.saveRoles([...roles, role]);
    },
    updateRole: (role: Role) => {
        const roles = Storage.getRoles().map(r => r.id === role.id ? role : r);
        Storage.saveRoles(roles);
    },
    deleteRole: (roleId: string) => {
        const roles = Storage.getRoles().filter(r => r.id !== roleId || r.isSystem);
        Storage.saveRoles(roles);
    },

    // Projects
    getProjects: (): Project[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        return JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]');
    },
    saveProject: (project: Project) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const projects = Storage.getProjects();
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify([...projects, project]));
    },
    updateProject: (project: Project) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const projects = Storage.getProjects().map(p => p.id === project.id ? project : p);
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    },

    // Phases
    getPhases: (projectId: string): Phase[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        const allPhases: Phase[] = JSON.parse(localStorage.getItem(KEYS.PHASES) || '[]');
        return allPhases.filter(p => p.projectId === projectId);
    },
    savePhases: (phases: Phase[]) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const allPhases = JSON.parse(localStorage.getItem(KEYS.PHASES) || '[]').filter(
            (p: Phase) => !phases.some(newP => newP.id === p.id)
        );
        localStorage.setItem(KEYS.PHASES, JSON.stringify([...allPhases, ...phases]));
    },
    updatePhase: (phase: Phase) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const allPhases = JSON.parse(localStorage.getItem(KEYS.PHASES) || '[]').map(
            (p: Phase) => p.id === phase.id ? phase : p
        );
        localStorage.setItem(KEYS.PHASES, JSON.stringify(allPhases));
    },

    // Artifacts
    getArtifacts: (projectId: string, phaseId?: string): Artifact[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        const allArts: Artifact[] = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]');
        let filtered = allArts.filter(a => a.projectId === projectId);
        if (phaseId) filtered = filtered.filter(a => a.phaseId === phaseId);
        return filtered;
    },
    saveArtifact: (artifact: Artifact) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const allArts = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]');
        localStorage.setItem(KEYS.ARTIFACTS, JSON.stringify([...allArts, artifact]));
    },
    updateArtifact: (artifact: Artifact) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const allArts = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]').map(
            (a: Artifact) => a.id === artifact.id ? artifact : a
        );
        localStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(allArts));
    },

    // Notifications
    getNotifications: (): Notification[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
    },
    saveNotification: (notif: Notification) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const all = Storage.getNotifications();
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([notif, ...all]));
    },
    markNotificationRead: (id: string) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const all = Storage.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(all));
    },
    clearAllNotifications: () => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
    },

    // Runs (v0.8)
    getRuns: (projectId: string, phaseId?: string): Run[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        const all = JSON.parse(localStorage.getItem(KEYS.RUNS) || '[]');
        let filtered = all.filter((r: Run) => r.projectId === projectId);
        if (phaseId) filtered = filtered.filter((r: Run) => r.phaseId === phaseId);
        return filtered;
    },
    getRun: (runId: string): Run | undefined => {
        if (typeof window === 'undefined') return undefined;
        if (typeof localStorage === 'undefined') return undefined;
        const all = JSON.parse(localStorage.getItem(KEYS.RUNS) || '[]');
        return all.find((r: Run) => r.id === runId);
    },
    saveRun: (run: Run) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const all = JSON.parse(localStorage.getItem(KEYS.RUNS) || '[]');
        // Upsert
        const existingIndex = all.findIndex((r: Run) => r.id === run.id);
        if (existingIndex >= 0) {
            all[existingIndex] = run;
        } else {
            all.push(run);
        }
        localStorage.setItem(KEYS.RUNS, JSON.stringify(all));
    },

    // Evaluations (v0.8)
    getEvaluations: (runId: string): ArtifactEvaluation[] => {
        if (typeof window === 'undefined') return [];
        if (typeof localStorage === 'undefined') return [];
        const all = JSON.parse(localStorage.getItem(KEYS.EVALUATIONS) || '[]');
        return all.filter((e: ArtifactEvaluation) => e.runId === runId);
    },
    saveEvaluation: (evalItem: ArtifactEvaluation) => {
        if (typeof window === 'undefined') return;
        if (typeof localStorage === 'undefined') return;
        const all = JSON.parse(localStorage.getItem(KEYS.EVALUATIONS) || '[]');
        all.push(evalItem);
        localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify(all));
    }
};
