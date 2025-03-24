/*
  Warnings:

  - Added the required column `ownerId` to the `AiConversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiConversation" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
