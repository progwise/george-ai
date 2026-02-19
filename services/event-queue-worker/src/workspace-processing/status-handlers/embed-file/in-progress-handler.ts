import { EmbedDocumentStatus } from '@george-ai/event-service-client'

import { logger } from '../../../common'

export async function inProgressHandler(event: EmbedDocumentStatus) {
  // Implementation for handling in-progress embed file status
  logger.debug('Embed document is in progress', { event })
}
