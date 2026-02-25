import { WorkerType, createLogger } from '@george-ai/app-commons'

export const WORKER_ID = `event-queue-worker-${process.pid}`

const logger = createLogger('event-queue-worker')
export { logger }

export const subscriptions = new Map<
  WorkerType | 'WORKER_REGISTRY',
  {
    startedAt: Date
    processedEvents: number
    lastProcessedTimestamp: number
    cleanupFunction: () => Promise<void>
  }
>()
