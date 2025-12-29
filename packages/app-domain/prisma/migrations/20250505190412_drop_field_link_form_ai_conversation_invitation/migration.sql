/*
  Warnings:

  - You are about to drop the column `link` on the `AiConversationInvitation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AiConversationInvitation_conversationId_key";

-- AlterTable
ALTER TABLE "AiConversationInvitation" DROP COLUMN "link";
