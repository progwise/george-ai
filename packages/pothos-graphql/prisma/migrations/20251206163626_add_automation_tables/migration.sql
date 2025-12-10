-- CreateEnum
CREATE TYPE "public"."AutomationItemStatus" AS ENUM ('PENDING', 'SUCCESS', 'WARNING', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TriggerType" AS ENUM ('MANUAL', 'ENRICHMENT', 'SCHEDULE');

-- CreateTable
CREATE TABLE "public"."AiConnectorTypeWorkspace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "connectorType" TEXT NOT NULL,

    CONSTRAINT "AiConnectorTypeWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiConnector" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "connectorType" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "name" TEXT,
    "config" JSONB NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastTestedAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "AiConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiAutomation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "connectorAction" TEXT NOT NULL,
    "connectorActionConfig" JSONB NOT NULL,
    "filter" JSONB,
    "schedule" TEXT,
    "executeOnEnrichment" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AiAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiAutomationItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "automationId" TEXT NOT NULL,
    "listItemId" TEXT NOT NULL,
    "inScope" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."AutomationItemStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "AiAutomationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiAutomationItemExecution" (
    "id" TEXT NOT NULL,
    "automationItemId" TEXT NOT NULL,
    "batchId" TEXT,
    "status" "public"."AutomationItemStatus" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiAutomationItemExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiAutomationBatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "automationId" TEXT NOT NULL,
    "status" "public"."BatchStatus" NOT NULL DEFAULT 'PENDING',
    "triggeredBy" "public"."TriggerType" NOT NULL,
    "itemsTotal" INTEGER NOT NULL DEFAULT 0,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsSuccess" INTEGER NOT NULL DEFAULT 0,
    "itemsWarning" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiAutomationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiConnectorTypeWorkspace_workspaceId_idx" ON "public"."AiConnectorTypeWorkspace"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AiConnectorTypeWorkspace_workspaceId_connectorType_key" ON "public"."AiConnectorTypeWorkspace"("workspaceId", "connectorType");

-- CreateIndex
CREATE INDEX "AiConnector_workspaceId_idx" ON "public"."AiConnector"("workspaceId");

-- CreateIndex
CREATE INDEX "AiAutomation_workspaceId_idx" ON "public"."AiAutomation"("workspaceId");

-- CreateIndex
CREATE INDEX "AiAutomation_listId_idx" ON "public"."AiAutomation"("listId");

-- CreateIndex
CREATE INDEX "AiAutomationItem_automationId_status_idx" ON "public"."AiAutomationItem"("automationId", "status");

-- CreateIndex
CREATE INDEX "AiAutomationItem_automationId_inScope_idx" ON "public"."AiAutomationItem"("automationId", "inScope");

-- CreateIndex
CREATE INDEX "AiAutomationItem_listItemId_idx" ON "public"."AiAutomationItem"("listItemId");

-- CreateIndex
CREATE UNIQUE INDEX "AiAutomationItem_automationId_listItemId_key" ON "public"."AiAutomationItem"("automationId", "listItemId");

-- CreateIndex
CREATE INDEX "AiAutomationItemExecution_automationItemId_idx" ON "public"."AiAutomationItemExecution"("automationItemId");

-- CreateIndex
CREATE INDEX "AiAutomationItemExecution_batchId_idx" ON "public"."AiAutomationItemExecution"("batchId");

-- CreateIndex
CREATE INDEX "AiAutomationBatch_automationId_idx" ON "public"."AiAutomationBatch"("automationId");

-- CreateIndex
CREATE INDEX "AiAutomationBatch_status_idx" ON "public"."AiAutomationBatch"("status");

-- AddForeignKey
ALTER TABLE "public"."AiConnectorTypeWorkspace" ADD CONSTRAINT "AiConnectorTypeWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiConnector" ADD CONSTRAINT "AiConnector_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomation" ADD CONSTRAINT "AiAutomation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomation" ADD CONSTRAINT "AiAutomation_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."AiList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomation" ADD CONSTRAINT "AiAutomation_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "public"."AiConnector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomationItem" ADD CONSTRAINT "AiAutomationItem_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "public"."AiAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomationItem" ADD CONSTRAINT "AiAutomationItem_listItemId_fkey" FOREIGN KEY ("listItemId") REFERENCES "public"."AiListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomationItemExecution" ADD CONSTRAINT "AiAutomationItemExecution_automationItemId_fkey" FOREIGN KEY ("automationItemId") REFERENCES "public"."AiAutomationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomationItemExecution" ADD CONSTRAINT "AiAutomationItemExecution_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."AiAutomationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiAutomationBatch" ADD CONSTRAINT "AiAutomationBatch_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "public"."AiAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
