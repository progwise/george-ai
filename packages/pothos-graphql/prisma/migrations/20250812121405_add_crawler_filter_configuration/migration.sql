-- AlterTable
ALTER TABLE "AiLibraryCrawler" ADD COLUMN     "allowedMimeTypes" TEXT,
ADD COLUMN     "excludePatterns" TEXT,
ADD COLUMN     "includePatterns" TEXT,
ADD COLUMN     "maxFileSize" INTEGER,
ADD COLUMN     "minFileSize" INTEGER;

-- CreateTable
CREATE TABLE "AiLibraryCrawlerOmittedFile" (
    "id" TEXT NOT NULL,
    "crawlerId" TEXT NOT NULL,
    "crawlerRunId" TEXT,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "omittedReason" TEXT NOT NULL,
    "filterType" TEXT NOT NULL,
    "filterValue" TEXT,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificationDate" TIMESTAMP(3),

    CONSTRAINT "AiLibraryCrawlerOmittedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiLibraryCrawlerOmittedFile_crawlerId_discoveredAt_idx" ON "AiLibraryCrawlerOmittedFile"("crawlerId", "discoveredAt");

-- CreateIndex
CREATE INDEX "AiLibraryCrawlerOmittedFile_crawlerRunId_idx" ON "AiLibraryCrawlerOmittedFile"("crawlerRunId");

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerOmittedFile" ADD CONSTRAINT "AiLibraryCrawlerOmittedFile_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "AiLibraryCrawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryCrawlerOmittedFile" ADD CONSTRAINT "AiLibraryCrawlerOmittedFile_crawlerRunId_fkey" FOREIGN KEY ("crawlerRunId") REFERENCES "AiLibraryCrawlerRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
