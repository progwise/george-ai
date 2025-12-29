/*
  Warnings:

  - You are about to drop the column `contentQuery` on the `AiListField` table. All the data in the column will be lost.
  - You are about to drop the column `useVectorStore` on the `AiListField` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AiListField" DROP COLUMN "contentQuery",
DROP COLUMN "useVectorStore";
