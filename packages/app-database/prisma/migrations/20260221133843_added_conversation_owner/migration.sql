-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
