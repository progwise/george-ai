import type {
  EmbedDocumentRequest,
  EnrichItemRequest,
  ExtractDocumentRequest,
  ProcessingRequest,
} from '@george-ai/event-service-client'

import { logger } from '../../common'
import { embedFile } from './embed-file'
import { enrichItem } from './enrich-item'
import { extractFile } from './extract-file'

export async function handleActionEvent(event: ProcessingRequest) {
  logger.debug('Handling action event', { event })
  try {
    switch (event.requestType) {
      case 'embedFile':
        await embedFile(event as EmbedDocumentRequest)
        break
      case 'extractFile':
        await extractFile(event as ExtractDocumentRequest)
        break
      case 'enrichItem':
        await enrichItem(event as EnrichItemRequest)
        break
      default:
        throw new Error(`Unknown process request type`)
    }
    logger.debug('Completed handling action event', { event })
  } catch (error) {
    logger.error('Error handling action event', { event, error })
    throw error
  }
}
