-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "processingEndedAt" TIMESTAMP(3),
ADD COLUMN     "processingErrorAt" TIMESTAMP(3),
ADD COLUMN     "processingErrorMessage" TEXT,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3);
