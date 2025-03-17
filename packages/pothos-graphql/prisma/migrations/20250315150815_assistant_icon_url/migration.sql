/*
  Warnings:

  - You are about to drop the column `icon` on the `AiAssistant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiAssistant" DROP COLUMN "icon",
ADD COLUMN     "iconUrl" TEXT;
