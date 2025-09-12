import { builder } from '../builder'

console.log('Setting up: Queue Management Types')

// Enum: Queue Type
export const QueueType = builder.enumType('QueueType', {
  values: ['ENRICHMENT', 'CONTENT_PROCESSING'] as const,
})

// Object Type: Queue Operation Result
export const QueueOperationResult = builder.simpleObject('QueueOperationResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    message: t.string({ nullable: false }),
    affectedCount: t.int({ nullable: true }),
  }),
})

// Object Type: Individual Queue Status
export const QueueStatus = builder.simpleObject('QueueStatus', {
  fields: (t) => ({
    queueType: t.field({ type: QueueType, nullable: false }),
    isRunning: t.boolean({ nullable: false }),
    pendingTasks: t.int({ nullable: false }),
    processingTasks: t.int({ nullable: false }),
    failedTasks: t.int({ nullable: false }),
    completedTasks: t.int({ nullable: false }),
    lastProcessedAt: t.string({ nullable: true }),
  }),
})

// Object Type: Queue System Status
export const QueueSystemStatus = builder.simpleObject('QueueSystemStatus', {
  fields: (t) => ({
    allWorkersRunning: t.boolean({ nullable: false }),
    totalPendingTasks: t.int({ nullable: false }),
    totalProcessingTasks: t.int({ nullable: false }),
    totalFailedTasks: t.int({ nullable: false }),
    lastUpdated: t.string({ nullable: false }),
    queues: t.field({
      type: [QueueStatus],
      nullable: { list: false, items: false },
    }),
  }),
})
