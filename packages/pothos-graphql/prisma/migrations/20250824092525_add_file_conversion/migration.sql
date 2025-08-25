-- CreateTable
CREATE TABLE "AiLibraryFileConversion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "hasTimeout" BOOLEAN NOT NULL DEFAULT false,
    "hasPartialResult" BOOLEAN NOT NULL DEFAULT false,
    "hasUnsupportedFormat" BOOLEAN NOT NULL DEFAULT false,
    "hasConversionError" BOOLEAN NOT NULL DEFAULT false,
    "hasLegacyFormat" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "fileConverterOptions" TEXT,
    "processingTimeMs" INTEGER,

    CONSTRAINT "AiLibraryFileConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiLibraryFileConversion_fileId_createdAt_idx" ON "AiLibraryFileConversion"("fileId", "createdAt");

-- CreateIndex
CREATE INDEX "AiLibraryFileConversion_libraryId_fileId_createdAt_idx" ON "AiLibraryFileConversion"("libraryId", "fileId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiLibraryFileConversion" ADD CONSTRAINT "AiLibraryFileConversion_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "AiLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLibraryFileConversion" ADD CONSTRAINT "AiLibraryFileConversion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
