import { eventClient } from '../client'
import { getActionSubject, getStatusSubject, logger } from './common'
import { ActionEvent, StatusEvent } from './schema'

export async function publishActionEvent(event: ActionEvent, timeoutMs?: number) {
  const subject = getActionSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing action event', { subject, event })
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
