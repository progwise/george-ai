-- AlterTable
ALTER TABLE "public"."AiLibrary" ADD COLUMN     "extractionModelId" TEXT;

-- CreateTable
CREATE TABLE "public"."AiFileExtraction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "extractionInput" JSONB,
    "extractionOutput" JSONB,
    "error" TEXT,
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiFileExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiFileExtraction_fileId_idx" ON "public"."AiFileExtraction"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "AiFileExtraction_sourceId_fileId_key" ON "public"."AiFileExtraction"("sourceId", "fileId");

-- AddForeignKey
ALTER TABLE "public"."AiLibrary" ADD CONSTRAINT "AiLibrary_extractionModelId_fkey" FOREIGN KEY ("extractionModelId") REFERENCES "public"."AiLanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiFileExtraction" ADD CONSTRAINT "AiFileExtraction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."AiListSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiFileExtraction" ADD CONSTRAINT "AiFileExtraction_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."AiLibraryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
