-- AlterTable
ALTER TABLE "AiLibrary" ADD COLUMN     "filesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "dropError" TEXT;
