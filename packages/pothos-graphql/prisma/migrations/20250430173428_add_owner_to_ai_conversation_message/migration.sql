-- AlterTable
ALTER TABLE "AiConversationMessage" ADD COLUMN     "ownerId" TEXT;

-- Delete orphaned conversation messages
DELETE FROM "AiConversationMessage" WHERE "ownerId" IS NULL;

-- Then set the NOT NULL constraint
ALTER TABLE "AiConversationMessage" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AiConversationMessage" ADD CONSTRAINT "AiConversationMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
