import { FieldEnrichmentRequest } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function enrichField(event: FieldEnrichmentRequest) {
  logger.debug('Enrich item for event', { event })
}
