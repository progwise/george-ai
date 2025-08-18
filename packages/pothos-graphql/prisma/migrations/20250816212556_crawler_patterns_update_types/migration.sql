/*
  Warnings:

  - You are about to drop the column `pagesCrawled` on the `AiLibraryCrawlerRun` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `AiLibraryUpdate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiLibraryCrawler" ADD COLUMN     "allowedMimeTypes" TEXT,
ADD COLUMN     "excludePatterns" TEXT,
ADD COLUMN     "includePatterns" TEXT,
ADD COLUMN     "maxFileSize" INTEGER,
ADD COLUMN     "minFileSize" INTEGER;

-- AlterTable
ALTER TABLE "AiLibraryCrawlerRun" DROP COLUMN "pagesCrawled";

-- AlterTable
ALTER TABLE "AiLibraryFile" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AiLibraryUpdate" DROP COLUMN "success",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "filterType" TEXT,
ADD COLUMN     "filterValue" TEXT,
ADD COLUMN     "updateType" TEXT NOT NULL DEFAULT 'added';
