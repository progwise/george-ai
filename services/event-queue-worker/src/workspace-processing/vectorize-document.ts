import { DocumentVectorizationRequest } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function vectorizeDocument(event: DocumentVectorizationRequest) {
  logger.debug(' vectorizeDocument', event)
}
