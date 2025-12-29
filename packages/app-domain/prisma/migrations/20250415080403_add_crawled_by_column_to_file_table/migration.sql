-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "crawledByCrawlerId" TEXT;

-- AddForeignKey
ALTER TABLE "AiLibraryFile" ADD CONSTRAINT "AiLibraryFile_crawledByCrawlerId_fkey" FOREIGN KEY ("crawledByCrawlerId") REFERENCES "AiLibraryCrawler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
