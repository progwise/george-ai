-- CreateTable
CREATE TABLE "AiConversationInvitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmationDate" TIMESTAMP(3),
    "conversationId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "allowDifferentEmailAddress" BOOLEAN NOT NULL DEFAULT false,
    "allowMultipleParticipants" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AiConversationInvitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiConversationInvitation" ADD CONSTRAINT "AiConversationInvitation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationInvitation" ADD CONSTRAINT "AiConversationInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
