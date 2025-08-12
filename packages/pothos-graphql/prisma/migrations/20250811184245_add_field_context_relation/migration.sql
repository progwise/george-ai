/*
  Warnings:

  - The primary key for the `AiListFieldContext` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AiListFieldContext` table. All the data in the column will be lost.
  - Added the required column `contextFieldId` to the `AiListFieldContext` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AiListFieldContext" DROP CONSTRAINT "AiListFieldContext_fieldId_fkey";

-- AlterTable
ALTER TABLE "AiListFieldContext" DROP CONSTRAINT "AiListFieldContext_pkey",
DROP COLUMN "id",
ADD COLUMN     "contextFieldId" TEXT NOT NULL,
ADD CONSTRAINT "AiListFieldContext_pkey" PRIMARY KEY ("fieldId", "contextFieldId");

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_contextFieldId_fkey" FOREIGN KEY ("contextFieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
