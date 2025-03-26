/*
  Warnings:

  - You are about to drop the column `icon` on the `AiAssistant` table. All the data in the column will be lost.
  - You are about to drop the column `languageModelId` on the `AiAssistant` table. All the data in the column will be lost.
  - You are about to drop the column `llmTemperature` on the `AiAssistant` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `AiAssistantBaseCase` table. All the data in the column will be lost.
  - You are about to drop the `AiLanguageModel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `AiLibraryUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AiAssistant" DROP CONSTRAINT "AiAssistant_languageModelId_fkey";

-- AlterTable
ALTER TABLE "AiAssistant" DROP COLUMN "icon",
DROP COLUMN "languageModelId",
DROP COLUMN "llmTemperature",
ADD COLUMN     "iconUrl" TEXT,
ADD COLUMN     "languageModel" TEXT DEFAULT 'OpenAI';

-- AlterTable
ALTER TABLE "AiAssistantBaseCase" DROP COLUMN "description",
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "instruction" TEXT;

-- AlterTable
ALTER TABLE "AiLibraryUsage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usedFor" TEXT;

-- DropTable
DROP TABLE "AiLanguageModel";
