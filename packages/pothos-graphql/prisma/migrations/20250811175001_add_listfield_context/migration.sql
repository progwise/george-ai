-- CreateTable
CREATE TABLE "AiListFieldContext" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldId" TEXT NOT NULL,
    "fieldid" TEXT NOT NULL,

    CONSTRAINT "AiListFieldContext_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiListFieldContext" ADD CONSTRAINT "AiListFieldContext_fieldid_fkey" FOREIGN KEY ("fieldid") REFERENCES "AiListField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
