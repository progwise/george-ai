import { ChunkFileAction } from '@george-ai/event-service-client'

import { logger } from '../../common'
import { logNoHandler } from '../common'

export async function chunkFile(event: ChunkFileAction) {
  // Implementation for chunking the file based on the event details
  logger.debug('Chunking file for event', { event })
  logNoHandler(event)
}
