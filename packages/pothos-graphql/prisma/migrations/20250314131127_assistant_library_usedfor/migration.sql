/*
  Warnings:

  - Added the required column `updatedAt` to the `AiLibraryUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiLibraryUsage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usedFor" TEXT;
