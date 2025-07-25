-- AlterTable
ALTER TABLE "AiLibrary" ADD COLUMN     "embeddingId" TEXT;

-- CreateTable
CREATE TABLE "AiEmbedding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT,
    "headers" TEXT,
    "options" TEXT,
    "aiLibraryId" TEXT NOT NULL,

    CONSTRAINT "AiEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiEmbedding_aiLibraryId_key" ON "AiEmbedding"("aiLibraryId");

-- AddForeignKey
ALTER TABLE "AiEmbedding" ADD CONSTRAINT "AiEmbedding_aiLibraryId_fkey" FOREIGN KEY ("aiLibraryId") REFERENCES "AiLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
