import { EnrichItemRequest } from '@george-ai/event-service-client'

import { logNoHandler, logger } from '../common'

export async function enrichItem(event: EnrichItemRequest) {
  logger.debug('Enrich item for event', { event })
  logNoHandler(event)
}
