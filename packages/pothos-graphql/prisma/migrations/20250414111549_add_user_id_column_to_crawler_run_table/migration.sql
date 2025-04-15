/*
  Warnings:

  - Added the required column `runByUserId` to the `AiLibraryCrawlerRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiLibraryCrawlerRun" ADD COLUMN     "runByUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerRun" ADD CONSTRAINT "AiLibraryCrawlerRun_runByUserId_fkey" FOREIGN KEY ("runByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
