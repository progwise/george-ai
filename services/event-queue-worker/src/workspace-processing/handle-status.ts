import {
  DocumentExtractionStatus,
  DocumentVectorizationStatus,
  FieldEnrichmentStatus,
  MigrateFileStatus,
} from '@george-ai/event-service-client'

import { logger } from '../common'

export async function handleStatus(
  event: DocumentExtractionStatus | DocumentVectorizationStatus | FieldEnrichmentStatus | MigrateFileStatus,
) {
  logger.warn('Received status event - no handling implemented', event)
}
