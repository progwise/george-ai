import { ExtractDocumentStatus } from '@george-ai/event-service-client'

import { logNoHandler, logger } from '../../common'
import { extractDocumentCompleted } from './completed'

export async function handleExtractFileStatus(event: ExtractDocumentStatus) {
  logger.debug('Handling extractDocument status', { event })
  try {
    switch (event.status) {
      case 'pending':
        logNoHandler(event)
        break
      case 'in-progress':
        logNoHandler(event)
        break
      case 'completed':
        await extractDocumentCompleted(event)
        break
      case 'failed':
        logNoHandler(event)
        break
      default:
        logger.warn('Unknown extractFile status', { event })
    }
    logger.debug('Completed handling extractFile status', { event })
  } catch (error) {
    logger.error('Error handling extractFile status', { event, error })
    throw error
  }
}
