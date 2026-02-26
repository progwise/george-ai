import { createLogger } from '@george-ai/app-commons'

export const WORKER_ID = `event-queue-worker-${process.pid}`

const logger = createLogger('event-queue-worker')
export { logger }
