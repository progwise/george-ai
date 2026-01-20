import { eventClient } from '../client'
import { getTaskSubject, logger } from './common'
import { AiCall } from './schema'

export const publishProviderCallEvent = async (event: AiCall) => {
  const subject = getTaskSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug(`Publishing provider call event to subject`, { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: 30000,
  })
}
