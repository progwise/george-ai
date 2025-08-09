/*
  Warnings:

  - Added the required column `sourceType` to the `AiListField` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiListField" ADD COLUMN     "fileProperty" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sourceType" TEXT NOT NULL;
