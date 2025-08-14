/*
  Warnings:

  - You are about to drop the column `pagesCrawled` on the `AiLibraryCrawlerRun` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `AiLibraryUpdate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiLibraryCrawlerRun" DROP COLUMN "pagesCrawled";

-- AlterTable
ALTER TABLE "AiLibraryUpdate" DROP COLUMN "success";
