/*
  Warnings:

  - You are about to drop the `AiLibraryCrawlerOmittedFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiLibraryCrawlerOmittedFile" DROP CONSTRAINT "AiLibraryCrawlerOmittedFile_crawlerId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibraryCrawlerOmittedFile" DROP CONSTRAINT "AiLibraryCrawlerOmittedFile_crawlerRunId_fkey";

-- AlterTable
ALTER TABLE "AiLibraryUpdate" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "filterType" TEXT,
ADD COLUMN     "filterValue" TEXT,
ADD COLUMN     "updateType" TEXT NOT NULL DEFAULT 'added';

-- DropTable
DROP TABLE "AiLibraryCrawlerOmittedFile";
