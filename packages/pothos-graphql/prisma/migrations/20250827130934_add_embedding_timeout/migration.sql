-- AlterTable
ALTER TABLE "AiFileContentExtractionTask" ALTER COLUMN "extractionStartedAt" DROP NOT NULL,
ALTER COLUMN "extractionStartedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AiLibrary" ADD COLUMN     "embeddingTimeoutMs" INTEGER DEFAULT 180000;
