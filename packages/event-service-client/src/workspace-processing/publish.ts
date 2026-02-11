import { eventClient } from '../client'
import { getRequestSubject, getStatusSubject, logger } from './common'
import { ProcessingRequest, ProcessingStatus } from './schema'

export async function publishProcessingRequest(event: ProcessingRequest, timeoutMs?: number) {
  const subject = getRequestSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing request event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}

export async function publishProcessingStatus(event: ProcessingStatus, timeoutMs?: number) {
  const subject = getStatusSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing status event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
