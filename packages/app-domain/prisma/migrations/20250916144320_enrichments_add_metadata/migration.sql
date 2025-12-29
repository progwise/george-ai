
BEGIN;

-- RenameTable
ALTER TABLE "AiListEnrichmentQueue" RENAME TO "AiListEnrichmentTask";

-- Rename constraints
ALTER TABLE "AiListEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentQueue_pkey" TO "AiListEnrichmentTask_pkey";
ALTER TABLE "AiListEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentQueue_fieldId_fkey" TO "AiListEnrichmentTask_fieldId_fkey";
ALTER TABLE "AiListEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentQueue_fileId_fkey" TO "AiListEnrichmentTask_fileId_fkey";
ALTER TABLE "AiListEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentQueue_listId_fkey" TO "AiListEnrichmentTask_listId_fkey";

-- Add metadata column
ALTER TABLE "AiListEnrichmentTask" ADD COLUMN "metadata" TEXT;

-- CreateIndex
CREATE INDEX "AiListEnrichmentTask_listId_status_idx" ON "AiListEnrichmentTask"("listId", "status");

-- CreateIndex
CREATE INDEX "AiListEnrichmentTask_status_priority_requestedAt_idx" ON "AiListEnrichmentTask"("status", "priority", "requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiListEnrichmentTask_listId_fieldId_fileId_key" ON "AiListEnrichmentTask"("listId", "fieldId", "fileId");

COMMIT;
