/*
  Warnings:

  - You are about to drop the column `fieldid` on the `AiListFieldContext` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiListFieldContext" DROP CONSTRAINT "AiListFieldContext_fieldid_fkey";

-- AlterTable
ALTER TABLE "AiListFieldContext" DROP COLUMN "fieldid";

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
