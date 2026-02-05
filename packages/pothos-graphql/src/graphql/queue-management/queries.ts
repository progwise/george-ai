import { prisma } from '@george-ai/app-database'

import { isAutomationWorkerRunning } from '../../worker-queue/automation-queue-worker'
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
      const automationWorkerRunning = isAutomationWorkerRunning()

      return {
        allWorkersRunning: enrichmentWorkerRunning && automationWorkerRunning,
        totalPendingTasks: enrichmentPending + automationPending,
        totalProcessingTasks: enrichmentProcessing + automationProcessing,
        totalFailedTasks: enrichmentFailed + automationFailed,
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
