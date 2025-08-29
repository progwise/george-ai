/*
  Warnings:

  - You are about to drop the `AiFileEmbeddingTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AiFileMarkdownTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiFileEmbeddingTask" DROP CONSTRAINT "AiFileEmbeddingTask_fileId_fkey";

-- DropForeignKey
ALTER TABLE "AiFileEmbeddingTask" DROP CONSTRAINT "AiFileEmbeddingTask_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "AiFileMarkdownTask" DROP CONSTRAINT "AiFileMarkdownTask_fileId_fkey";

-- DropForeignKey
ALTER TABLE "AiFileMarkdownTask" DROP CONSTRAINT "AiFileMarkdownTask_libraryId_fkey";

-- DropTable
DROP TABLE "AiFileEmbeddingTask";

-- DropTable
DROP TABLE "AiFileMarkdownTask";

-- CreateTable
CREATE TABLE "AiFileContentExtractionTask" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "extractionMethod" TEXT NOT NULL,
    "extractionStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractionFinishedAt" TIMESTAMP(3),
    "extractionFailedAt" TIMESTAMP(3),
    "extractionPartiallyFinishedAt" TIMESTAMP(3),
    "extractionTimeoutAt" TIMESTAMP(3),
    "embeddingStartedAt" TIMESTAMP(3),
    "embeddingFinishedAt" TIMESTAMP(3),
    "embeddingFailedAt" TIMESTAMP(3),
    "embeddingPartiallyFinishedAt" TIMESTAMP(3),
    "embeddingTimeoutAt" TIMESTAMP(3),
    "markdownFileName" TEXT,
    "chunksCount" INTEGER,
    "embeddingModelName" TEXT,
    "extractionTimeoutMs" INTEGER,
    "embeddingTimeoutMs" INTEGER,
    "metadata" TEXT,
    "extractionOptions" TEXT,
    "extractionConfidenceScore" DOUBLE PRECISION,
    "embeddingConfidenceScore" DOUBLE PRECISION,

    CONSTRAINT "AiFileContentExtractionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiFileContentExtractionTask_fileId_extractionStartedAt_idx" ON "AiFileContentExtractionTask"("fileId", "extractionStartedAt");

-- CreateIndex
CREATE INDEX "AiFileContentExtractionTask_libraryId_fileId_extractionStar_idx" ON "AiFileContentExtractionTask"("libraryId", "fileId", "extractionStartedAt");

-- CreateIndex
CREATE INDEX "AiFileContentExtractionTask_extractionMethod_extractionStar_idx" ON "AiFileContentExtractionTask"("extractionMethod", "extractionStartedAt");

-- AddForeignKey
ALTER TABLE "AiFileContentExtractionTask" ADD CONSTRAINT "AiFileContentExtractionTask_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiFileContentExtractionTask" ADD CONSTRAINT "AiFileContentExtractionTask_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
