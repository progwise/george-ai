import { eventClient } from '../client'
import { getProcessSubject, getStatusSubject, logger } from './common'
import { ProcessEvent, StatusEvent } from './schema'

export async function publishRequestEvent(event: ProcessEvent, timeoutMs?: number) {
  const subject = getProcessSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing request event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}

export async function publishStatusEvent(event: StatusEvent, timeoutMs?: number) {
  const subject = getStatusSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing status event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
