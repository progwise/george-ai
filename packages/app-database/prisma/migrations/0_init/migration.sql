-- CreateEnum
CREATE TYPE "AiAssistantType" AS ENUM ('CHATBOT', 'DOCUMENT_GENERATOR');

-- CreateEnum
CREATE TYPE "AiLibraryType" AS ENUM ('GOOGLE_DRIVE', 'POCKETBASE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "given_name" TEXT,
    "family_name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAssistant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "icon" TEXT,
    "ownerId" TEXT NOT NULL,
    "assistantType" "AiAssistantType" NOT NULL,

    CONSTRAINT "AiAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLibrary" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "apiToken" TEXT,
    "lastProcessed" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "libraryType" "AiLibraryType" NOT NULL,

    CONSTRAINT "AiLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLibraryUsage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assistantId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,

    CONSTRAINT "AiLibraryUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLibraryFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "libraryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originUri" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "chunks" INTEGER,
    "uploadedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "AiLibraryFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversationParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "assistantId" TEXT,

    CONSTRAINT "AiConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversationMessage" (
    "id" TEXT NOT NULL,
    "sequenceNumber" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "AiConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AiLibraryUsage_assistantId_libraryId_key" ON "AiLibraryUsage"("assistantId", "libraryId");

-- AddForeignKey
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibrary" ADD CONSTRAINT "AiLibrary_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryUsage" ADD CONSTRAINT "AiLibraryUsage_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryUsage" ADD CONSTRAINT "AiLibraryUsage_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryFile" ADD CONSTRAINT "AiLibraryFile_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationParticipant" ADD CONSTRAINT "AiConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationParticipant" ADD CONSTRAINT "AiConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationParticipant" ADD CONSTRAINT "AiConversationParticipant_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationMessage" ADD CONSTRAINT "AiConversationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "AiConversationParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversationMessage" ADD CONSTRAINT "AiConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

