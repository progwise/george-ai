-- DropForeignKey
ALTER TABLE "AiLibraryCrawlerRun" DROP CONSTRAINT "AiLibraryCrawlerRun_crawlerId_fkey";

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerRun" ADD CONSTRAINT "AiLibraryCrawlerRun_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "AiLibraryCrawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
