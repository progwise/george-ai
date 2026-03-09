import {
  DocumentExtractionStatus,
  DocumentVectorizationStatus,
  FieldEnrichmentStatus,
} from '@george-ai/event-service-client'

import { logger } from '../common'

export async function handleStatus(
  event: DocumentExtractionStatus | DocumentVectorizationStatus | FieldEnrichmentStatus,
) {
  logger.warn('Received status event - no handling implemented', event)
}
