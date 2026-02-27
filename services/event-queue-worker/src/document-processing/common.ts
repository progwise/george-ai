import { createLogger } from '@george-ai/app-commons'
import { ProcessingRequest, ProcessingStatus } from '@george-ai/event-service-client'

export const logger = createLogger('event-queue-worker:document-processing')

export function logNoHandler(event: ProcessingRequest | ProcessingStatus) {
  logger.debug(`No handle for event`, { event })
}
