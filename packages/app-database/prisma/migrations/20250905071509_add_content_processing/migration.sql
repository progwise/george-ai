/*
  Warnings:

  - You are about to drop the column `chunks` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingEndedAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingErrorAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingErrorMessage` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingStartedAt` on the `AiLibraryFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiLibrary" ADD COLUMN     "embeddingTimeoutMs" INTEGER DEFAULT 180000;

-- AlterTable
ALTER TABLE "AiLibraryFile" DROP COLUMN "chunks",
DROP COLUMN "processedAt",
DROP COLUMN "processingEndedAt",
DROP COLUMN "processingErrorAt",
DROP COLUMN "processingErrorMessage",
DROP COLUMN "processingStartedAt";

-- CreateTable
CREATE TABLE "AiContentProcessingTask" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeoutMs" INTEGER,
    "embeddingModelName" TEXT,
    "extractionOptions" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "processingFinishedAt" TIMESTAMP(3),
    "processingFailedAt" TIMESTAMP(3),
    "processingTimeout" BOOLEAN NOT NULL DEFAULT false,
    "extractionStartedAt" TIMESTAMP(3),
    "extractionFinishedAt" TIMESTAMP(3),
    "extractionFailedAt" TIMESTAMP(3),
    "extractionTimeout" BOOLEAN NOT NULL DEFAULT false,
    "embeddingStartedAt" TIMESTAMP(3),
    "embeddingFinishedAt" TIMESTAMP(3),
    "embeddingFailedAt" TIMESTAMP(3),
    "embeddingTimeout" BOOLEAN NOT NULL DEFAULT false,
    "chunksCount" INTEGER,
    "chunksSize" INTEGER,
    "metadata" TEXT,

    CONSTRAINT "AiContentProcessingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiContentExtractionSubTask" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "contentProcessingTaskId" TEXT NOT NULL,
    "extractionMethod" TEXT NOT NULL,
    "markdownFileName" TEXT,

    CONSTRAINT "AiContentExtractionSubTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiContentProcessingTask_fileId_extractionStartedAt_idx" ON "AiContentProcessingTask"("fileId", "extractionStartedAt");

-- CreateIndex
CREATE INDEX "AiContentProcessingTask_libraryId_fileId_extractionStartedA_idx" ON "AiContentProcessingTask"("libraryId", "fileId", "extractionStartedAt");

-- CreateIndex
CREATE INDEX "AiContentExtractionSubTask_contentProcessingTaskId_idx" ON "AiContentExtractionSubTask"("contentProcessingTaskId");

-- CreateIndex
CREATE INDEX "AiContentExtractionSubTask_extractionMethod_startedAt_idx" ON "AiContentExtractionSubTask"("extractionMethod", "startedAt");

-- AddForeignKey
ALTER TABLE "AiContentProcessingTask" ADD CONSTRAINT "AiContentProcessingTask_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiContentProcessingTask" ADD CONSTRAINT "AiContentProcessingTask_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiContentExtractionSubTask" ADD CONSTRAINT "AiContentExtractionSubTask_contentProcessingTaskId_fkey" FOREIGN KEY ("contentProcessingTaskId") REFERENCES "AiContentProcessingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
