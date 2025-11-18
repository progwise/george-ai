-- CreateTable
CREATE TABLE "public"."AiConversationFeedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalContext" TEXT NOT NULL,
    "originalAnswer" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "languageModelName" TEXT,
    "answerMessageId" TEXT,
    "answerAssistantId" TEXT,
    "answerUserId" TEXT,
    "feedbackSuggestion" TEXT,
    "feedbackUserId" TEXT,

    CONSTRAINT "AiConversationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiConversationFeedback_answerMessageId_key" ON "public"."AiConversationFeedback"("answerMessageId");

-- AddForeignKey
ALTER TABLE "public"."AiConversationFeedback" ADD CONSTRAINT "AiConversationFeedback_answerMessageId_fkey" FOREIGN KEY ("answerMessageId") REFERENCES "public"."AiConversationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiConversationFeedback" ADD CONSTRAINT "AiConversationFeedback_answerAssistantId_fkey" FOREIGN KEY ("answerAssistantId") REFERENCES "public"."AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiConversationFeedback" ADD CONSTRAINT "AiConversationFeedback_answerUserId_fkey" FOREIGN KEY ("answerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiConversationFeedback" ADD CONSTRAINT "AiConversationFeedback_feedbackUserId_fkey" FOREIGN KEY ("feedbackUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
