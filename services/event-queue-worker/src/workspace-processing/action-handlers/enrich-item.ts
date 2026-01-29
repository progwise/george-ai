import { EnrichItemAction } from '@george-ai/event-service-client'

import { logger } from '../../common'
import { logNoHandler } from '../common'

export async function enrichItem(event: EnrichItemAction) {
  logger.debug('Enrich item for event', { event })
  logNoHandler(event)
}
