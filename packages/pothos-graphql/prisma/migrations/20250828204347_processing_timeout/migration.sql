/*
  Warnings:

  - You are about to drop the column `embeddingTimeoutAt` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `embeddingTimeoutMs` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `extractionTimeoutMs` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - Added the required column `processingTimeoutMs` to the `AiFileContentExtractionTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiFileContentExtractionTask" DROP COLUMN "embeddingTimeoutAt",
DROP COLUMN "embeddingTimeoutMs",
DROP COLUMN "extractionTimeoutMs",
ADD COLUMN     "processingTimeoutAt" TIMESTAMP(3),
ADD COLUMN     "processingTimeoutMs" INTEGER NOT NULL;
