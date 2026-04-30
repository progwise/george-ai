/*
  Warnings:

  - You are about to drop the column `ownerId` on the `AiAssistant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `AiLibrary` table. All the data in the column will be lost.
  - You are about to drop the column `runByUserId` on the `AiLibraryCrawlerRun` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `AiList` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AiListItem` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `AiListItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AiListItem` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AiModelUsage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ApiKey` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiAssistant" DROP CONSTRAINT "AiAssistant_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AiConversation" DROP CONSTRAINT "AiConversation_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibrary" DROP CONSTRAINT "AiLibrary_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AiLibraryCrawlerRun" DROP CONSTRAINT "AiLibraryCrawlerRun_runByUserId_fkey";

-- DropForeignKey
ALTER TABLE "AiList" DROP CONSTRAINT "AiList_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AiModelUsage" DROP CONSTRAINT "AiModelUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropIndex
DROP INDEX "AiModelUsage_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "AiAssistant" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "AiLibrary" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "AiLibraryCrawlerRun" DROP COLUMN "runByUserId";

-- AlterTable
ALTER TABLE "AiList" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "AiListItem" DROP COLUMN "createdAt",
DROP COLUMN "metadata",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "AiModelUsage" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "userId";
