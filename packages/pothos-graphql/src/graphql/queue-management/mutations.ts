import {
  startAllWorkers,
  startAutomationQueueWorker,
  startEnrichmentQueueWorker,
  stopAllWorkers,
  stopAutomationQueueWorker,
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
        } else if (queueType === 'AUTOMATION') {
          await startAutomationQueueWorker()
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
        } else if (queueType === 'AUTOMATION') {
          stopAutomationQueueWorker()
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
