-- CreateTable
CREATE TABLE "AiFileConversionAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "hasEndlessLoop" BOOLEAN NOT NULL DEFAULT false,
    "hasTimeout" BOOLEAN NOT NULL DEFAULT false,
    "hasPartialResult" BOOLEAN NOT NULL DEFAULT false,
    "hasUnsupportedFormat" BOOLEAN NOT NULL DEFAULT false,
    "hasConversionError" BOOLEAN NOT NULL DEFAULT false,
    "hasLegacyFormat" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "fileConverterOptions" TEXT,
    "processingTimeMs" INTEGER,

    CONSTRAINT "AiFileConversionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiFileConversionAttempt_fileId_createdAt_idx" ON "AiFileConversionAttempt"("fileId", "createdAt");

-- CreateIndex
CREATE INDEX "AiFileConversionAttempt_success_createdAt_idx" ON "AiFileConversionAttempt"("success", "createdAt");

-- AddForeignKey
ALTER TABLE "AiFileConversionAttempt" ADD CONSTRAINT "AiFileConversionAttempt_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
