import { eventClient } from '../client'
import { USAGE_STREAM_NAME, getConsumerName, getConsumerSubjectFilters } from './common'

export async function ensureUsageConsumer(workspaceId: string) {
  const consumerName = getConsumerName({ workspaceId })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId })
  await eventClient.ensureConsumer({
    streamName: USAGE_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 1 * 60 * 1000,
    maxDeliveryAttempts: 3,
    maxPendingMessages: 1000,
  })
}
