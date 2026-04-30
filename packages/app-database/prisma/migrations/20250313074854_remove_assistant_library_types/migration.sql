/*
  Warnings:

  - You are about to drop the column `assistantType` on the `AiAssistant` table. All the data in the column will be lost.
  - You are about to drop the column `libraryType` on the `AiLibrary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiAssistant" DROP COLUMN "assistantType";

-- AlterTable
ALTER TABLE "AiLibrary" DROP COLUMN "libraryType";

-- DropEnum
DROP TYPE "AiAssistantType";

-- DropEnum
DROP TYPE "AiLibraryType";
