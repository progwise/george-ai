/*
  Warnings:

  - You are about to drop the column `embeddingPartiallyFinishedAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingSkippedAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `extractionPartiallyFinishedAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `extractionTimeoutAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `processingTimeoutAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `processingTimeoutMs` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `validationFailedAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiFileContentExtractionTask" DROP COLUMN "embeddingPartiallyFinishedAt",
DROP COLUMN "embeddingSkippedAt",
DROP COLUMN "extractionPartiallyFinishedAt",
DROP COLUMN "extractionTimeoutAt",
DROP COLUMN "processingTimeoutAt",
DROP COLUMN "processingTimeoutMs",
DROP COLUMN "validationFailedAt",
ADD COLUMN     "chunksSize" INTEGER,
ADD COLUMN     "embeddingSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "embeddingTimeout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extractionSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extractionTimeout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingFailedAt" TIMESTAMP(3),
ADD COLUMN     "processingTimeout" BOOLEAN NOT NULL DEFAULT false;
