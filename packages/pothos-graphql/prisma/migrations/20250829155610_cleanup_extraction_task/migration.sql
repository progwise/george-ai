/*
  Warnings:

  - You are about to drop the column `embeddingSkipped` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.
  - You are about to drop the column `extractionSkipped` on the `AiFileContentExtractionTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiFileContentExtractionTask" DROP COLUMN "embeddingSkipped",
DROP COLUMN "extractionSkipped";
