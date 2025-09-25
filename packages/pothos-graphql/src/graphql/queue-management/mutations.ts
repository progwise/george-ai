import { Prisma } from '../../../prisma/generated/client'

import { prisma } from '../../prisma'
import {
  startAllWorkers,
  startContentProcessingWorker,
  startEnrichmentQueueWorker,
  stopAllWorkers,
  stopContentProcessingWorker,
  stopEnrichmentQueueWorker,
} from '../../worker-queue'
import { builder } from '../builder'
import { QueueOperationResult, QueueType } from './types'

console.log('Setting up: Queue Management Mutations')

// Mutation: Start all workers
builder.mutationField('startAllQueueWorkers', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    resolve: async (_, __, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        await startAllWorkers()
        return {
          success: true,
          message: 'All queue workers started successfully',
        }
      } catch (error) {
        console.error('Failed to start all workers:', error)
        return {
          success: false,
          message: `Failed to start workers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Stop all workers
builder.mutationField('stopAllQueueWorkers', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    resolve: async (_, __, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        stopAllWorkers()
        return {
          success: true,
          message: 'All queue workers stopped successfully',
        }
      } catch (error) {
        console.error('Failed to stop all workers:', error)
        return {
          success: false,
          message: `Failed to stop workers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Start specific queue worker
builder.mutationField('startQueueWorker', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      queueType: t.arg({ type: QueueType, required: true }),
    },
    resolve: async (_, { queueType }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        if (queueType === 'ENRICHMENT') {
          await startEnrichmentQueueWorker()
        } else if (queueType === 'CONTENT_PROCESSING') {
          await startContentProcessingWorker()
        }

        return {
          success: true,
          message: `${queueType} worker started successfully`,
        }
      } catch (error) {
        console.error(`Failed to start ${queueType} worker:`, error)
        return {
          success: false,
          message: `Failed to start ${queueType} worker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Stop specific queue worker
builder.mutationField('stopQueueWorker', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      queueType: t.arg({ type: QueueType, required: true }),
    },
    resolve: async (_, { queueType }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        if (queueType === 'ENRICHMENT') {
          stopEnrichmentQueueWorker()
        } else if (queueType === 'CONTENT_PROCESSING') {
          stopContentProcessingWorker()
        }

        return {
          success: true,
          message: `${queueType} worker stopped successfully`,
        }
      } catch (error) {
        console.error(`Failed to stop ${queueType} worker:`, error)
        return {
          success: false,
          message: `Failed to stop ${queueType} worker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Retry failed tasks for a specific queue type
builder.mutationField('retryFailedTasks', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      queueType: t.arg({ type: QueueType, required: true }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_, { queueType, libraryId }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        let updateResult: { count: number }

        if (queueType === 'ENRICHMENT') {
          const where = libraryId ? { status: 'failed' as const, file: { libraryId } } : { status: 'failed' as const }

          updateResult = await prisma.aiEnrichmentTask.updateMany({
            where,
            data: {
              status: 'pending',
              startedAt: null,
              completedAt: null,
            },
          })
        } else {
          // Content processing - retry tasks with any failed status
          const where: Prisma.AiContentProcessingTaskWhereInput = {
            ...(libraryId && { file: { libraryId } }),
            OR: [
              { processingFailedAt: { not: null } },
              { extractionFailedAt: { not: null } },
              { embeddingFailedAt: { not: null } },
            ],
          }

          updateResult = await prisma.aiContentProcessingTask.updateMany({
            where,
            data: {
              processingStartedAt: null,
              processingFinishedAt: null,
              processingFailedAt: null,
              processingCancelled: false,
              extractionStartedAt: null,
              extractionFinishedAt: null,
              extractionFailedAt: null,
              embeddingStartedAt: null,
              embeddingFinishedAt: null,
              embeddingFailedAt: null,
              metadata: null,
              chunksCount: null,
              chunksSize: null,
            },
          })

          // Reset any related subtasks
          const retriedTasks = await prisma.aiContentProcessingTask.findMany({
            where,
            select: { id: true },
          })

          if (retriedTasks.length > 0) {
            await prisma.aiContentExtractionSubTask.deleteMany({
              where: {
                contentProcessingTaskId: { in: retriedTasks.map((t) => t.id) },
              },
            })
          }
        }

        return {
          success: true,
          message: `Successfully retried ${updateResult.count} failed ${queueType.toLowerCase()} tasks`,
          affectedCount: updateResult.count,
        }
      } catch (error) {
        console.error(`Failed to retry ${queueType} tasks:`, error)
        return {
          success: false,
          message: `Failed to retry ${queueType.toLowerCase()} tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Clear failed tasks for a specific queue type
builder.mutationField('clearFailedTasks', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      queueType: t.arg({ type: QueueType, required: true }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_, { queueType, libraryId }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        let deleteResult: { count: number }

        if (queueType === 'ENRICHMENT') {
          const where = libraryId ? { status: 'failed' as const, file: { libraryId } } : { status: 'failed' as const }

          deleteResult = await prisma.aiEnrichmentTask.deleteMany({
            where,
          })
        } else {
          // Content processing - delete tasks with any failed status
          const where = libraryId ? { file: { libraryId } } : {}

          deleteResult = await prisma.aiContentProcessingTask.deleteMany({
            where: {
              ...where,
              OR: [
                { processingFailedAt: { not: null } },
                { extractionFailedAt: { not: null } },
                { embeddingFailedAt: { not: null } },
              ],
            },
          })
        }

        return {
          success: true,
          message: `Successfully cleared ${deleteResult.count} failed ${queueType.toLowerCase()} tasks`,
          affectedCount: deleteResult.count,
        }
      } catch (error) {
        console.error(`Failed to clear ${queueType} tasks:`, error)
        return {
          success: false,
          message: `Failed to clear ${queueType.toLowerCase()} tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Clear pending tasks for a specific queue type
builder.mutationField('clearPendingTasks', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      queueType: t.arg({ type: QueueType, required: true }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_, { queueType, libraryId }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        let deleteResult: { count: number }

        if (queueType === 'ENRICHMENT') {
          deleteResult = await prisma.aiEnrichmentTask.deleteMany({
            where: { startedAt: null, file: libraryId ? { libraryId } : undefined },
          })
        } else if (queueType === 'CONTENT_PROCESSING') {
          deleteResult = await prisma.aiContentProcessingTask.deleteMany({
            where: { processingStartedAt: null, file: libraryId ? { libraryId } : undefined },
          })
        } else {
          throw new Error(`Unknown queue type: ${queueType}`)
        }

        return {
          success: true,
          message: `Successfully cleared ${deleteResult.count} pending ${queueType.toLowerCase()} tasks`,
          affectedCount: deleteResult.count,
        }
      } catch (error) {
        console.error(`Failed to clear ${queueType} tasks:`, error)
        return {
          success: false,
          message: `Failed to clear ${queueType.toLowerCase()} tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)

// Mutation: Cancel content processing tasks (enrichment cancellation not yet implemented - see issue #754)
builder.mutationField('cancelContentProcessingTasks', (t) =>
  t.field({
    type: QueueOperationResult,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    args: {
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_, { libraryId }, { session }) => {
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        // Use raw SQL with COALESCE to efficiently update all cancelled tasks in one query
        const updateResult = await prisma.$executeRaw`
          UPDATE "AiContentProcessingTask" 
          SET 
            "processingFinishedAt" = COALESCE("processingFinishedAt", NOW()),
            "extractionFinishedAt" = COALESCE("extractionFinishedAt", NOW()),
            "embeddingFinishedAt" = COALESCE("embeddingFinishedAt", NOW()),
            "processingCancelled" = true
          WHERE 
            "processingStartedAt" IS NOT NULL 
            AND "processingFinishedAt" IS NULL 
            AND "processingFailedAt" IS NULL
            ${libraryId ? Prisma.sql`AND "fileId" IN (SELECT id FROM "AiFile" WHERE "libraryId" = ${libraryId})` : Prisma.empty}
        `

        // Update related subtasks in a single query
        await prisma.$executeRaw`
          UPDATE "AiContentExtractionSubTask"
          SET "failedAt" = NOW()
          WHERE "contentProcessingTaskId" IN (
            SELECT id FROM "AiContentProcessingTask" 
            WHERE "processingCancelled" = true
              AND "processingStartedAt" IS NOT NULL
              ${libraryId ? Prisma.sql`AND "fileId" IN (SELECT id FROM "AiFile" WHERE "libraryId" = ${libraryId})` : Prisma.empty}
          )
          AND "finishedAt" IS NULL 
          AND "failedAt" IS NULL
        `

        return {
          success: true,
          message: `Successfully cancelled ${updateResult} content processing tasks`,
          affectedCount: Number(updateResult),
        }
      } catch (error) {
        console.error('Failed to cancel content processing tasks:', error)
        return {
          success: false,
          message: `Failed to cancel content processing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    },
  }),
)
