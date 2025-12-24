-- AlterTable
ALTER TABLE "Job" ADD COLUMN "finishedAt" DATETIME;
ALTER TABLE "Job" ADD COLUMN "phaseId" TEXT;
ALTER TABLE "Job" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Job" ADD COLUMN "startedAt" DATETIME;

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "runId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "qaStatus" TEXT,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Artifact_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
