-- DropForeignKey
ALTER TABLE "AiLibraryCrawlerRun" DROP CONSTRAINT "AiLibraryCrawlerRun_runByUserId_fkey";

-- AlterTable
ALTER TABLE "AiLibraryCrawlerRun" ADD COLUMN     "runByCronJob" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "runByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerRun" ADD CONSTRAINT "AiLibraryCrawlerRun_runByUserId_fkey" FOREIGN KEY ("runByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
