import { eventClient } from '../client'
import { getEventSubject, logger } from './common'
import { EmbedDocumentRequest, EnrichItemRequest, ExtractDocumentRequest, ProcessingStatus } from './schema'

export async function publishProcessingRequest(
  event: ExtractDocumentRequest | EmbedDocumentRequest | EnrichItemRequest,
  timeoutMs?: number,
) {
  const subject = getEventSubject({ ...event, eventType: 'request' })
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing request event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}

export async function publishProcessingStatus(event: ProcessingStatus, timeoutMs?: number) {
  const subject = getEventSubject({ ...event, eventType: 'status' })
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug('Publishing status event', { subject, event })
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
