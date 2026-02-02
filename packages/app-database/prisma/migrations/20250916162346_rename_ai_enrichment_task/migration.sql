
BEGIN;

-- RenameTable
ALTER TABLE "AiListEnrichmentTask" RENAME TO "AiEnrichmentTask";

-- Rename constraints
ALTER TABLE "AiEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentTask_pkey" TO "AiEnrichmentTask_pkey";
ALTER TABLE "AiEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentTask_fieldId_fkey" TO "AiEnrichmentTask_fieldId_fkey";
ALTER TABLE "AiEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentTask_fileId_fkey" TO "AiEnrichmentTask_fileId_fkey";
ALTER TABLE "AiEnrichmentTask" RENAME CONSTRAINT "AiListEnrichmentTask_listId_fkey" TO "AiEnrichmentTask_listId_fkey";

ALTER INDEX "AiListEnrichmentTask_listId_status_idx" RENAME TO "AiEnrichmentTask_listId_status_idx";
ALTER INDEX "AiListEnrichmentTask_status_priority_requestedAt_idx" RENAME TO "AiEnrichmentTask_status_priority_requestedAt_idx";
ALTER INDEX "AiListEnrichmentTask_listId_fieldId_fileId_key" RENAME TO "AiEnrichmentTask_listId_fieldId_fileId_key";

COMMIT;
