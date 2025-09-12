import { prisma } from '../../prisma'
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
    resolve: async (_, __, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      // Get enrichment queue stats
      const enrichmentPending = await prisma.aiListEnrichmentQueue.count({
        where: { startedAt: null, completedAt: null, status: { not: 'failed' } },
      })

      const enrichmentProcessing = await prisma.aiListEnrichmentQueue.count({
        where: { startedAt: { not: null }, completedAt: null, status: { not: 'failed' } },
      })

      const enrichmentFailed = await prisma.aiListEnrichmentQueue.count({
        where: { status: 'failed' },
      })

      const enrichmentCompleted = await prisma.aiListEnrichmentQueue.count({
        where: { completedAt: { not: null } },
      })

      const enrichmentLastProcessed = await prisma.aiListEnrichmentQueue.findFirst({
        where: { completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      })

      // Get content processing queue stats
      const contentProcessingPending = await prisma.aiContentProcessingTask.count({
        where: {
          processingStartedAt: null,
          processingFinishedAt: null,
          processingFailedAt: null,
        },
      })

      const contentProcessingProcessing = await prisma.aiContentProcessingTask.count({
        where: {
          processingStartedAt: { not: null },
          processingFinishedAt: null,
          processingFailedAt: null,
        },
      })

      const contentProcessingFailed = await prisma.aiContentProcessingTask.count({
        where: {
          OR: [
            { processingFailedAt: { not: null } },
            { extractionFailedAt: { not: null } },
            { embeddingFailedAt: { not: null } },
          ],
        },
      })

      const contentProcessingCompleted = await prisma.aiContentProcessingTask.count({
        where: { processingFinishedAt: { not: null } },
      })

      const contentProcessingLastProcessed = await prisma.aiContentProcessingTask.findFirst({
        where: { processingFinishedAt: { not: null } },
        orderBy: { processingFinishedAt: 'desc' },
        select: { processingFinishedAt: true },
      })

      // Check if workers are running
      const enrichmentWorkerRunning = isEnrichmentWorkerRunning()
      const contentProcessingWorkerRunning = isContentProcessingWorkerRunning()

      return {
        allWorkersRunning: enrichmentWorkerRunning && contentProcessingWorkerRunning,
        totalPendingTasks: enrichmentPending + contentProcessingPending,
        totalProcessingTasks: enrichmentProcessing + contentProcessingProcessing,
        totalFailedTasks: enrichmentFailed + contentProcessingFailed,
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
        ],
      }
    },
  }),
)
