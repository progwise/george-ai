/*
  Warnings:

  - You are about to drop the column `modelName` on the `AiModelUsage` table. All the data in the column will be lost.
  - You are about to drop the column `providerName` on the `AiModelUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AiModelUsage" DROP COLUMN "modelName",
DROP COLUMN "providerName";
