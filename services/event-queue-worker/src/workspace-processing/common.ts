import { ProcessingRequest, ProcessingStatus } from '@george-ai/event-service-client'

import { logger } from '../common'

export function logNoHandler(event: ProcessingRequest | ProcessingStatus) {
  logger.debug(`No handle for event`, { event })
}
