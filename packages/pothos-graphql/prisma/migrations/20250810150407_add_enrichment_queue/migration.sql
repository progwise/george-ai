-- CreateTable
CREATE TABLE "AiListEnrichmentQueue" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "AiListEnrichmentQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiListEnrichmentQueue_listId_status_idx" ON "AiListEnrichmentQueue"("listId", "status");

-- CreateIndex
CREATE INDEX "AiListEnrichmentQueue_status_priority_requestedAt_idx" ON "AiListEnrichmentQueue"("status", "priority", "requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiListEnrichmentQueue_listId_fieldId_fileId_key" ON "AiListEnrichmentQueue"("listId", "fieldId", "fileId");

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
