-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "runId" TEXT,
    "stepKey" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtifactEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artifactId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "rubricKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "notesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtifactEvaluation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Job_runId_idx" ON "Job"("runId");

-- CreateIndex
CREATE INDEX "Job_agent_idx" ON "Job"("agent");
