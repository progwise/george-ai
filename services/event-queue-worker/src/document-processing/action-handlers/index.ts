import type {
  EmbedDocumentRequest,
  EnrichItemRequest,
  ExtractDocumentRequest,
  ProcessingRequest,
} from '@george-ai/event-service-client'

import { logger } from '../common'
import { embedFile } from './embed-file'
import { enrichItem } from './enrich-item'
import { extractDocument } from './extract-document'

export async function handleProcessingEvent(event: ProcessingRequest) {
  logger.debug('Handling processing event', { event })
  try {
    switch (event.requestType) {
      case 'embedFile':
        await embedFile(event as EmbedDocumentRequest)
        break
      case 'extractFile':
        await extractDocument(event as ExtractDocumentRequest)
        break
      case 'enrichItem':
        await enrichItem(event as EnrichItemRequest)
        break
      default:
        throw new Error(`Unknown processing request type`)
    }
    logger.debug('Completed handling processing event', { event })
  } catch (error) {
    logger.error('Error handling processing event', { event, error })
    throw error
  }
}
