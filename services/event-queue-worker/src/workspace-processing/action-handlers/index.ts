import type { ActionEvent, EmbedFileAction, EnrichItemAction, ExtractFileAction } from '@george-ai/event-service-client'

import { logger } from '../../common'
import { embedFile } from './embed-file'
import { enrichItem } from './enrich-item'
import { extractFile } from './extract-file'

export async function handleActionEvent(event: ActionEvent) {
  logger.debug('Handling action event', { event })
  try {
    switch (event.actionType) {
      case 'embedFile':
        await embedFile(event as EmbedFileAction)
        break
      case 'extractFile':
        await extractFile(event as ExtractFileAction)
        break
      case 'enrichItem':
        await enrichItem(event as EnrichItemAction)
        break
      default:
        throw new Error(`Unknown process event type`)
    }
    logger.debug('Completed handling action event', { event })
  } catch (error) {
    logger.error('Error handling action event', { event, error })
    throw error
  }
}
