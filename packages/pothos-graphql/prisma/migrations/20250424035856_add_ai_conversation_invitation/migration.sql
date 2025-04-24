-- CreateTable
CREATE TABLE "AiConversationInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "link" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmationDate" TIMESTAMP(3),
    "conversationId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "allowDifferentEmailAddress" BOOLEAN NOT NULL DEFAULT false,
    "allowMultipleParticipants" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiConversationInvitation_conversationId_key" ON "AiConversationInvitation"("conversationId");

-- AddForeignKey
ALTER TABLE "AiConversationInvitation" ADD CONSTRAINT "AiConversationInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationInvitation" ADD CONSTRAINT "AiConversationInvitation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
