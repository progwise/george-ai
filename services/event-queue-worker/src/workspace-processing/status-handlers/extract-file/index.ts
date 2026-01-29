import { ExtractFileStatus } from '@george-ai/event-service-client'

import { logger } from '../../../common'
import { logNoHandler } from '../../common'
import { extractFileCompleted } from './completed'

export async function handleExtractFileStatus(event: ExtractFileStatus) {
  logger.debug('Handling extractFile status', { event })
  try {
    switch (event.status) {
      case 'pending':
        logNoHandler(event)
        break
      case 'in-progress':
        logNoHandler(event)
        break
      case 'completed':
        await extractFileCompleted(event)
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
