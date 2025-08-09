/*
  Warnings:

  - A unique constraint covering the columns `[fileId,fieldId]` on the table `AiListItemCache` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fieldId` to the `AiListItemCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiListItemCache" ADD COLUMN     "fieldId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AiListItemCache_fileId_fieldId_key" ON "AiListItemCache"("fileId", "fieldId");

-- AddForeignKey
ALTER TABLE "AiListItemCache" ADD CONSTRAINT "AiListItemCache_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
