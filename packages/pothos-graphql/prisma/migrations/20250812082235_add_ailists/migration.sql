-- CreateTable
CREATE TABLE "AiList" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiListSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" TEXT NOT NULL,
    "libraryId" TEXT,

    CONSTRAINT "AiListSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiListParticipant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AiListParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiListField" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sourceType" TEXT NOT NULL,
    "fileProperty" TEXT,
    "languageModel" TEXT,
    "prompt" TEXT,
    "useMarkdown" BOOLEAN,

    CONSTRAINT "AiListField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiListFieldContext" (
    "fieldId" TEXT NOT NULL,
    "contextFieldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiListFieldContext_pkey" PRIMARY KEY ("fieldId","contextFieldId")
);

-- CreateTable
CREATE TABLE "AiListItemCache" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "valueString" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueDate" TIMESTAMP(3),
    "valueBoolean" BOOLEAN,

    CONSTRAINT "AiListItemCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiListEnrichmentQueue" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "AiListEnrichmentQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiListParticipant_listId_userId_key" ON "AiListParticipant"("listId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiListItemCache_fileId_fieldId_key" ON "AiListItemCache"("fileId", "fieldId");

-- CreateIndex
CREATE INDEX "AiListEnrichmentQueue_listId_status_idx" ON "AiListEnrichmentQueue"("listId", "status");

-- CreateIndex
CREATE INDEX "AiListEnrichmentQueue_status_priority_requestedAt_idx" ON "AiListEnrichmentQueue"("status", "priority", "requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiListEnrichmentQueue_listId_fieldId_fileId_key" ON "AiListEnrichmentQueue"("listId", "fieldId", "fileId");

-- AddForeignKey
ALTER TABLE "AiList" ADD CONSTRAINT "AiList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListSource" ADD CONSTRAINT "AiListSource_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListSource" ADD CONSTRAINT "AiListSource_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListParticipant" ADD CONSTRAINT "AiListParticipant_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListParticipant" ADD CONSTRAINT "AiListParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListField" ADD CONSTRAINT "AiListField_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_contextFieldId_fkey" FOREIGN KEY ("contextFieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListItemCache" ADD CONSTRAINT "AiListItemCache_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListItemCache" ADD CONSTRAINT "AiListItemCache_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "AiListField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiListEnrichmentQueue" ADD CONSTRAINT "AiListEnrichmentQueue_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
