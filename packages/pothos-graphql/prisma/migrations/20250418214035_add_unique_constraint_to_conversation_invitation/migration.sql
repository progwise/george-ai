/*
  Warnings:

  - A unique constraint covering the columns `[conversationId]` on the table `AiConversationInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AiConversationInvitation_conversationId_key" ON "AiConversationInvitation"("conversationId");
