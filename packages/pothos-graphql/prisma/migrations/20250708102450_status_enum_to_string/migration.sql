/*
  Warnings:

  - The `status` column on the `AiLibraryFile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AiLibraryFile" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "FileStatus";

-- CreateIndex
CREATE INDEX "AiLibraryFile_status_idx" ON "AiLibraryFile"("status");
