import { eventClient } from '../client'
import { getBatchCallSubject, logger } from './common'
import { ModelCall } from './schema'

export const publishProviderCallEvent = async (event: ModelCall) => {
  const subject = getBatchCallSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug(`Publishing provider call event to subject`, { subject, event })
  const { inbox, msgId, streamName } = await eventClient.publish({
    subject,
    payload,
    timeoutMs: 30000,
  })

  logger.debug('Published provider call event', { subject, streamName, msgId, inbox })

  return { subject, inbox, msgId, streamName }
}

export const publishProviderResponseEvent = async (event: ModelCall) => {
  const subject = getBatchCallSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug(`Publishing provider response event to subject`, { subject, event })
  const { inbox, msgId, streamName } = await eventClient.publish({
    subject,
    payload,
    timeoutMs: 30000,
  })

  logger.debug('Published provider response event', { subject, streamName, msgId, inbox })

  return { subject, inbox, msgId, streamName }
}
