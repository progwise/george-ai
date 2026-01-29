import { EmbedFileStatus } from '@george-ai/event-service-client'

import { logger } from '../../../common'
import { logNoHandler } from '../../common'
import { inProgressHandler } from './in-progress-handler'

export async function handleEmbedFileStatus(event: EmbedFileStatus) {
  logger.debug('Handling embedFile status', { event })
  try {
    switch (event.status) {
      case 'pending':
        logNoHandler(event)
        break
      case 'in-progress':
        await inProgressHandler(event)
        break
      case 'completed':
        logNoHandler(event)
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
