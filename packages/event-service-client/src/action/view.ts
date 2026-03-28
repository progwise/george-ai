import { eventClient } from '../client'
import { ACTION_STREAM_NAME } from './common'
import { AsyncAction, EventQueueRequest, EventQueueRequestSchema } from './schema'
import { getAsyncSubjectFilters } from './subject'

export async function viewStreamedRequests(params: {
  workspaceId: string
  action: AsyncAction
  take?: number
  startSequence?: number
}): Promise<{
  totalMessages: number
  requests: EventQueueRequest[]
  lastSequence: number
}> {
  const { workspaceId, action, take, startSequence } = params
  const subjectFilters = getAsyncSubjectFilters({ workspaceId, action, verb: 'request' })

  const { totalMessages, messages, lastSequence } = await eventClient.getMessages({
    streamName: ACTION_STREAM_NAME,
    schema: EventQueueRequestSchema,
    subjectFilters,
    startSequence,
    take,
  })

  return {
    totalMessages,
    requests: messages.map((message) => message.entry),
    lastSequence,
  }
}
