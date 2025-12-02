-- Add workspaceId to AiConversation
-- Phase 2 of workspace member management: conversations are now workspace-scoped

-- Step 1: Add the column as nullable first
ALTER TABLE "public"."AiConversation" ADD COLUMN "workspaceId" TEXT;

-- Step 2: Populate workspaceId from owner's default workspace
UPDATE "public"."AiConversation" c
SET "workspaceId" = u."defaultWorkspaceId"
FROM "public"."User" u
WHERE c."ownerId" = u."id";

-- Step 3: Make the column required now that all rows have a value
ALTER TABLE "public"."AiConversation" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AiConversation_workspaceId_idx" ON "public"."AiConversation"("workspaceId");

-- AddForeignKey
ALTER TABLE "public"."AiConversation" ADD CONSTRAINT "AiConversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
