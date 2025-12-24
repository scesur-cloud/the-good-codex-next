-- CreateTable
CREATE TABLE "ProjectTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rubricId" TEXT NOT NULL,
    "briefConfig" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "runId" TEXT,
    "stepKey" TEXT,
    "projectId" TEXT,
    "phaseId" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "lockedAt" DATETIME,
    "lockedBy" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    CONSTRAINT "Job_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("agent", "createdAt", "error", "finishedAt", "id", "input", "output", "phaseId", "projectId", "runId", "startedAt", "status", "stepKey", "type", "updatedAt") SELECT "agent", "createdAt", "error", "finishedAt", "id", "input", "output", "phaseId", "projectId", "runId", "startedAt", "status", "stepKey", "type", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_runId_idx" ON "Job"("runId");
CREATE INDEX "Job_agent_idx" ON "Job"("agent");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
