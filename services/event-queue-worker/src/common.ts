import { createLogger } from '@george-ai/web-utils'

export const WORKSPACE_IDS = process.env.WORKSPACE_IDS || '*'
export const WORKER_ID = `event-queue-worker-${process.pid}`

const logger = createLogger('Event Queue Worker')
export { logger }
