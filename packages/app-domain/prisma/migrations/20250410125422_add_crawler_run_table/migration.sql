-- CreateTable
CREATE TABLE "AiLibraryCrawlerRun" (
    "id" TEXT NOT NULL,
    "crawlerId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "success" BOOLEAN,
    "pagesCrawled" INTEGER,

    CONSTRAINT "AiLibraryCrawlerRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerRun" ADD CONSTRAINT "AiLibraryCrawlerRun_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "AiLibraryCrawler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
