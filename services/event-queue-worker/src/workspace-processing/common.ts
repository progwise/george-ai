import { ActionEvent, StatusEvent } from '@george-ai/event-service-client'

import { logger } from '../common'

export function logNoHandler(event: ActionEvent | StatusEvent) {
  logger.debug(`No handle for event`, { event })
}
