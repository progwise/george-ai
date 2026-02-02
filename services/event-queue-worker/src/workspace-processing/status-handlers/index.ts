import type { StatusEvent } from '@george-ai/event-service-client'

import { logger } from '../../common'

export async function handleStatusEvent(event: StatusEvent) {
  logger.debug('Handling status event', { event })
  try {
    switch (event.actionType) {
      case 'embedFile':
        logger.debug('embedFile status not implemented', { event })
        break
      case 'extractFile':
        logger.debug('extractFile status not implemented', { event })
        break
      case 'enrichItem':
        logger.debug('enrichItem status not implemented', { event })
        break
      default:
        throw new Error(`Unknown status event type`)
    }
    logger.debug('Completed handling status event', { event })
  } catch (error) {
    logger.error('Error handling status event', { event, error })
    throw error
  }
}
