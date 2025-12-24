
export type Channel = 'IG' | 'LinkedIn' | 'WhatsApp' | 'Web';
export type ProductType = 'PDF' | 'TXT' | 'Canva' | 'App';

export enum TaskStatus {
  NOT_STARTED = 'NotStarted',
  IN_PROGRESS = 'InProgress',
  REVIEW = 'Review',
  DONE = 'Done',
  BLOCKED = 'Blocked'
}

export type QAStatus = 'pending' | 'pass' | 'fail' | 'superseded';

export interface Artifact {
  id: string;
  projectId: string;
  phaseId: string;
  parentId?: string;
  version: number;
  filename: string;
  format: 'md' | 'txt' | 'json' | 'png' | 'jpg';
  content: string;
  createdAt: number;
  qaStatus: QAStatus;
}

export interface Phase {
  id: string;
  projectId: string;
  messageNo: number;
  phaseTitle: string;
  status: TaskStatus;
  artifacts: string[]; // artifact IDs
  ownerRole?: string;
  dod?: { id: string; text: string; checked: boolean }[];
  consultedRoles?: string[];
  informedRoles?: string[];
}

// v0.9 Agent Squad Types
export type RunMode = 'MANUAL' | 'AUTO';
// Enums matching Prisma string values
export type RunStatus = 'PLANNING' | 'PRODUCING' | 'QA' | 'FIXING' | 'DONE' | 'ERROR';
export type AgentType = 'PLANNER' | 'PRODUCER' | 'QA' | 'FIXER';
export type JobStatus = 'pending' | 'running' | 'done' | 'error'; // Mapping from DB strings

export interface Job {
  id: string;
  agent: AgentType;
  status: JobStatus;
  lastMessage?: string | null;
  error?: string | null;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  stepKey?: string | null;
  runId?: string | null;
  input?: string;
  output?: string | null;
}

export interface ArtifactDto {
  id: string;
  agent: AgentType; // derived from Creator
  kind: "PLAN" | "OUTPUT";
  title: string;
  qaStatus?: "pending" | "pass" | "fail" | null;
  createdAt: string;
}

export interface EvaluationDto {
  id: string;
  rubricKey: string;
  verdict: "PASS" | "FAIL";
  score: number;
  artifactId: string;
  summary?: string;
  createdAt?: string;
}

export interface Run {
  id: string;
  projectId: string;
  phaseId: string;
  mode: RunMode;
  status: RunStatus;
  createdAt: string; // ISO
  startedAt?: string | null;
  finishedAt?: string | null;

  // Extended UI Data
  jobs?: Job[];
  artifacts?: ArtifactDto[];
  evaluations?: EvaluationDto[];
  finalArtifactId?: string | null;
}

export interface RunGetResponse {
  run: Run | null;
  stats: Record<AgentType, { pending: number, inFlight: number, done: number, failed: number }>;
  ops?: {
    activeWorkers: number;
    lastHeartbeatTs: string | null;
    queueDepth: number;
    runningJobs: number;
    stuckHints?: {
      staleLocks: number;
      noWorker: boolean;
    };
    adminEnabled: boolean;
    lastJob?: {
      id: string;
      agent: string;
      status: string;
      attempts: number;
      lockedAt: string | null;
      lockedBy: string | null;
      lastError: string | null;
      updatedAt: string;
    };
  };
}

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  phaseId: string;
  phaseTitle: string;
  status: TaskStatus;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  goal: string;
  targetAudience: string;
  channel: Channel;
  productType: ProductType;
  constraints?: string;
  existingAssets?: string;
  autoAssignRoles?: boolean;
  maxRoles?: number | null;
  eduLevel?: string;
  eduMode?: string;
  selectedRoleIds: string[];
}

export interface Role {
  id: string;
  name: string;
  definition: string;
  isAccountable: boolean;
  authorityLevel: number;
  capabilities?: string[];
  isSystem?: boolean;
}

export interface PhaseTemplate {
  phaseTitle: string;
  subtitle: string;
  ownerRole: string;
  dependencies: number[];
  dodItems: string[];
  artifactSections: string[];
}

export interface ArtifactEvaluation {
  id: string;
  artifactId: string;
  runId: string;
  rubricKey: string;
  score: number;
  verdict: string;
  notesJson: string | null;
  createdAt: Date;
}
