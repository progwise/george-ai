import { EmbedFileStatus } from '@george-ai/event-service-client'

import { logger } from '../../../common'

export async function inProgressHandler(event: EmbedFileStatus) {
  // Implementation for handling in-progress embed file status
  logger.debug('Embed file is in progress', { event })
}
