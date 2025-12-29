/*
  Warnings:

  - A unique constraint covering the columns `[crawledByCrawlerId,originUri]` on the table `AiLibraryFile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AiLibraryFile_crawledByCrawlerId_originUri_key" ON "AiLibraryFile"("crawledByCrawlerId", "originUri");
