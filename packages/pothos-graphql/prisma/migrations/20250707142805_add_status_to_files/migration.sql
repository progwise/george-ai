-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "AiLibraryFile_status_idx" ON "AiLibraryFile"("status");
