-- CreateTable
CREATE TABLE "AiLibraryCrawlerCronJob" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hour" INTEGER NOT NULL DEFAULT 0,
    "minute" INTEGER NOT NULL DEFAULT 0,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT true,
    "sunday" BOOLEAN NOT NULL DEFAULT true,
    "crawlerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiLibraryCrawlerCronJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiLibraryCrawlerCronJob_crawlerId_key" ON "AiLibraryCrawlerCronJob"("crawlerId");

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerCronJob" ADD CONSTRAINT "AiLibraryCrawlerCronJob_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "AiLibraryCrawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
