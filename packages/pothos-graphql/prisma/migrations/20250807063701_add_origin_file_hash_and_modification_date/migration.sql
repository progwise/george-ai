-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "originFileHash" TEXT,
ADD COLUMN     "originModificationDate" TIMESTAMP(3);
