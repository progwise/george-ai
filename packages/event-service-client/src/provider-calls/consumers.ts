import { eventClient } from '../client'
import { Provider } from '../provider/common'
import { AI_SERVICE_CALLS_STREAM_NAME, getConsumerName, getConsumerSubjectFilters } from './common'

export const ensureProviderInstanceConsumer = async (params: {
  workspaceId: string
  provider: Provider
  providerInstanceId: string
  modelNames: string[]
  maxPendingMessages: number
}) => {
  const { workspaceId, provider, providerInstanceId, modelNames, maxPendingMessages } = params
  const consumerName = getConsumerName({ workspaceId, provider, providerInstanceId })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, provider, modelNames })
  await eventClient.ensureConsumer({
    streamName: AI_SERVICE_CALLS_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 3 * 60 * 1000,
    maxDeliveryAttempts: 5,
    maxPendingMessages,
  })
}
