import { ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { logger } from '../common'
import { WORKSPACE_STREAM_NAME, getEventSubjectFilter } from './common'
import { EmbedDocumentRequest, EnrichItemRequest, ExtractDocumentRequest, ProcessingRequestSchema } from './schema'

export async function getRequests(
  workspaceId: string,
  requestType?: ProcessingRequestType | null,
  options?: { libraryId?: string | null; documentId?: string | null; startSequence?: number | null; take?: number },
): Promise<{
  items: {
    id: string
    subject: string
    deliveryCount: number
    request?: ExtractDocumentRequest | EmbedDocumentRequest | EnrichItemRequest | null
    error?: string
    rawText?: string
  }[]
  totalCount: number
  lastSequence: number
}> {
  const { libraryId, documentId, startSequence, take = 20 } = options || {}
  const subjectFilter = getEventSubjectFilter({ workspaceId, requestType, libraryId, documentId })
  const { rawMessages, totalCount, lastSequence } = await eventClient.getMessages({
    streamName: WORKSPACE_STREAM_NAME,
    subjectFilter,
    startSequence: startSequence ?? undefined,
    take,
  })
  const items = rawMessages.map((message) => {
    const rawText = new TextDecoder().decode(message.data)
    try {
      const json = JSON.parse(rawText) as unknown
      const request = ProcessingRequestSchema.parse(json)
      return {
        id: message.id,
        subject: message.subject,
        deliveryCount: message.deliveryCount,
        request,
      }
    } catch (error) {
      logger.error('getRequests Failed to parse message', { error, rawText, message })
      return {
        id: message.id,
        subject: message.subject,
        deliveryCount: message.deliveryCount,
        error: 'Failed to parse message',
        rawText,
      }
    }
  })
  return { items, totalCount, lastSequence }
}
