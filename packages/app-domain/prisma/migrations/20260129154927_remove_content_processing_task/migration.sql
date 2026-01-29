/*
  Warnings:

  - You are about to drop the `AiContentExtractionSubTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AiContentProcessingTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiContentExtractionSubTask" DROP CONSTRAINT "AiContentExtractionSubTask_contentProcessingTaskId_fkey";

-- DropForeignKey
ALTER TABLE "AiContentProcessingTask" DROP CONSTRAINT "AiContentProcessingTask_embeddingModelId_fkey";

-- DropForeignKey
ALTER TABLE "AiContentProcessingTask" DROP CONSTRAINT "AiContentProcessingTask_fileId_fkey";

-- DropForeignKey
ALTER TABLE "AiContentProcessingTask" DROP CONSTRAINT "AiContentProcessingTask_libraryId_fkey";

-- DropTable
DROP TABLE "AiContentExtractionSubTask";

-- DropTable
DROP TABLE "AiContentProcessingTask";
