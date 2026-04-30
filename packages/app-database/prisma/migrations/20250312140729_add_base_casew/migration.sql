-- AlterTable
ALTER TABLE "AiAssistant" ADD COLUMN     "languageModelId" TEXT,
ADD COLUMN     "llmTemperature" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "AiLanguageModel" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AiLanguageModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAssistantBaseCase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "assistantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AiAssistantBaseCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "AiLanguageModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAssistantBaseCase" ADD CONSTRAINT "AiAssistantBaseCase_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
