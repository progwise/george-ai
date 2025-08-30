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
CREATE TABLE "AiFileContentExtractionTask" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "extractionMethod" TEXT NOT NULL,
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
    "markdownFileName" TEXT,
    "chunksCount" INTEGER,
    "chunksSize" INTEGER,
    "metadata" TEXT,

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
