/*
  Warnings:

  - You are about to drop the column `chunks` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingEndedAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingErrorAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingErrorMessage` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `processingStartedAt` on the `AiLibraryFile` table. All the data in the column will be lost.
  - You are about to drop the `AiLibraryFileConversion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiLibraryFileConversion" DROP CONSTRAINT "AiLibraryFileConversion_fileId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibraryFileConversion" DROP CONSTRAINT "AiLibraryFileConversion_libraryId_fkey";

-- AlterTable
ALTER TABLE "AiLibraryFile" DROP COLUMN "chunks",
DROP COLUMN "processedAt",
DROP COLUMN "processingEndedAt",
DROP COLUMN "processingErrorAt",
DROP COLUMN "processingErrorMessage",
DROP COLUMN "processingStartedAt";

-- DropTable
DROP TABLE "AiLibraryFileConversion";

-- CreateTable
CREATE TABLE "AiFileMarkdownTask" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "libraryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "markdownFileName" TEXT NOT NULL,
    "metadata" TEXT,
    "fileConverterOptions" TEXT,

    CONSTRAINT "AiFileMarkdownTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiFileEmbeddingTask" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "libraryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "chunksCount" INTEGER,
    "markdownFileName" TEXT NOT NULL,
    "embeddingModelName" TEXT NOT NULL,
    "metadata" TEXT,
    "embeddingOptions" TEXT,

    CONSTRAINT "AiFileEmbeddingTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiFileMarkdownTask_fileId_startedAt_idx" ON "AiFileMarkdownTask"("fileId", "startedAt");

-- CreateIndex
CREATE INDEX "AiFileMarkdownTask_libraryId_fileId_startedAt_idx" ON "AiFileMarkdownTask"("libraryId", "fileId", "startedAt");

-- AddForeignKey
ALTER TABLE "AiFileMarkdownTask" ADD CONSTRAINT "AiFileMarkdownTask_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiFileMarkdownTask" ADD CONSTRAINT "AiFileMarkdownTask_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiFileEmbeddingTask" ADD CONSTRAINT "AiFileEmbeddingTask_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiFileEmbeddingTask" ADD CONSTRAINT "AiFileEmbeddingTask_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
