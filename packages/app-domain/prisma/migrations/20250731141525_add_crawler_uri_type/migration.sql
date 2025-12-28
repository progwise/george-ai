/*
  Warnings:

  - You are about to drop the column `url` on the `AiLibraryCrawler` table. All the data in the column will be lost.
  - Added the required column `uri` to the `AiLibraryCrawler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uriType` to the `AiLibraryCrawler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiLibraryCrawler" RENAME COLUMN "url" TO "uri";
ALTER TABLE "AiLibraryCrawler" ADD COLUMN "uriType" TEXT NOT NULL DEFAULT 'http';
ALTER TABLE "AiLibraryCrawler" ALTER COLUMN "uriType" DROP DEFAULT;
