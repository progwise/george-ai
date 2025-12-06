import { prisma } from '../../prisma'
import { isAutomationWorkerRunning } from '../../worker-queue/automation-queue-worker'
import { isContentProcessingWorkerRunning } from '../../worker-queue/content-processing-worker'
import { isEnrichmentWorkerRunning } from '../../worker-queue/enrichment-queue-worker'
import { builder } from '../builder'
import { QueueSystemStatus } from './types'

console.log('Setting up: Queue Management Queries')

// Query: Get queue system status
builder.queryField('queueSystemStatus', (t) =>
  t.field({
    type: QueueSystemStatus,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    resolve: async (_, __, { session, workspaceId }) => {
      const isAdmin = session?.user?.isAdmin ?? false

      // Build WHERE clauses based on user access
      // Admins see all tasks, non-admins see tasks from libraries/lists in their workspace
      const contentProcessingAccessFilter = isAdmin
        ? {}
        : {
            library: {
              workspaceId,
            },
          }

      const enrichmentAccessFilter = isAdmin
        ? {}
        : {
            list: {
              workspaceId,
            },
          }

      // Get enrichment queue stats (filtered by user access)
      const enrichmentPending = await prisma.aiEnrichmentTask.count({
        where: {
          ...enrichmentAccessFilter,
          startedAt: null,
          completedAt: null,
          status: { not: 'failed' },
        },
      })

      const enrichmentProcessing = await prisma.aiEnrichmentTask.count({
        where: {
          ...enrichmentAccessFilter,
          startedAt: { not: null },
          completedAt: null,
          status: { not: 'failed' },
        },
      })

      const enrichmentFailed = await prisma.aiEnrichmentTask.count({
        where: {
          ...enrichmentAccessFilter,
          status: 'failed',
        },
      })

      const enrichmentCompleted = await prisma.aiEnrichmentTask.count({
        where: {
          ...enrichmentAccessFilter,
          completedAt: { not: null },
        },
      })

      const enrichmentLastProcessed = await prisma.aiEnrichmentTask.findFirst({
        where: {
          ...enrichmentAccessFilter,
          completedAt: { not: null },
        },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      })

      // Get content processing queue stats (filtered by user access)
      const contentProcessingPending = await prisma.aiContentProcessingTask.count({
        where: {
          ...contentProcessingAccessFilter,
          processingStartedAt: null,
          processingFinishedAt: null,
          processingFailedAt: null,
        },
      })

      const contentProcessingProcessing = await prisma.aiContentProcessingTask.count({
        where: {
          ...contentProcessingAccessFilter,
          processingStartedAt: { not: null },
          processingFinishedAt: null,
          processingFailedAt: null,
        },
      })

      const contentProcessingFailed = await prisma.aiContentProcessingTask.count({
        where: {
          ...contentProcessingAccessFilter,
          OR: [
            { processingFailedAt: { not: null } },
            { extractionFailedAt: { not: null } },
            { embeddingFailedAt: { not: null } },
          ],
        },
      })

      const contentProcessingCompleted = await prisma.aiContentProcessingTask.count({
        where: {
          ...contentProcessingAccessFilter,
          processingFinishedAt: { not: null },
        },
      })

      const contentProcessingLastProcessed = await prisma.aiContentProcessingTask.findFirst({
        where: {
          ...contentProcessingAccessFilter,
          processingFinishedAt: { not: null },
        },
        orderBy: { processingFinishedAt: 'desc' },
        select: { processingFinishedAt: true },
      })

      // Get automation queue stats (filtered by user access)
      const automationAccessFilter = isAdmin
        ? {}
        : {
            automation: {
              list: {
                workspaceId,
              },
            },
          }

      const automationPending = await prisma.aiAutomationItem.count({
        where: {
          ...automationAccessFilter,
          status: 'PENDING',
          inScope: true,
        },
      })

      const automationProcessing = await prisma.aiAutomationItem.count({
        where: {
          ...automationAccessFilter,
          status: 'PROCESSING',
          inScope: true,
        },
      })

      const automationFailed = await prisma.aiAutomationItem.count({
        where: {
          ...automationAccessFilter,
          status: 'FAILED',
          inScope: true,
        },
      })

      const automationCompleted = await prisma.aiAutomationItem.count({
        where: {
          ...automationAccessFilter,
          status: 'SUCCESS',
          inScope: true,
        },
      })

      const automationLastProcessed = await prisma.aiAutomationItemExecution.findFirst({
        where: {
          automationItem: automationAccessFilter,
          finishedAt: { not: null },
        },
        orderBy: { finishedAt: 'desc' },
        select: { finishedAt: true },
      })

      // Check if workers are running
      const enrichmentWorkerRunning = isEnrichmentWorkerRunning()
      const contentProcessingWorkerRunning = isContentProcessingWorkerRunning()
      const automationWorkerRunning = isAutomationWorkerRunning()

      return {
        allWorkersRunning: enrichmentWorkerRunning && contentProcessingWorkerRunning && automationWorkerRunning,
        totalPendingTasks: enrichmentPending + contentProcessingPending + automationPending,
        totalProcessingTasks: enrichmentProcessing + contentProcessingProcessing + automationProcessing,
        totalFailedTasks: enrichmentFailed + contentProcessingFailed + automationFailed,
        lastUpdated: new Date().toISOString(),
        queues: [
          {
            queueType: 'ENRICHMENT' as const,
            isRunning: enrichmentWorkerRunning,
            pendingTasks: enrichmentPending,
            processingTasks: enrichmentProcessing,
            failedTasks: enrichmentFailed,
            completedTasks: enrichmentCompleted,
            lastProcessedAt: enrichmentLastProcessed?.completedAt?.toISOString() || null,
          },
          {
            queueType: 'CONTENT_PROCESSING' as const,
            isRunning: contentProcessingWorkerRunning,
            pendingTasks: contentProcessingPending,
            processingTasks: contentProcessingProcessing,
            failedTasks: contentProcessingFailed,
            completedTasks: contentProcessingCompleted,
            lastProcessedAt: contentProcessingLastProcessed?.processingFinishedAt?.toISOString() || null,
          },
          {
            queueType: 'AUTOMATION' as const,
            isRunning: automationWorkerRunning,
            pendingTasks: automationPending,
            processingTasks: automationProcessing,
            failedTasks: automationFailed,
            completedTasks: automationCompleted,
            lastProcessedAt: automationLastProcessed?.finishedAt?.toISOString() || null,
          },
        ],
      }
    },
  }),
)
