import { eventClient } from '../client'
import { ModelProvider } from '../model-provider/common'
import { MODEL_CALLS_STREAM_NAME, getBatchConsumerName, getBatchConsumerSubjectFilters } from './common'

export const ensureProviderInstanceConsumer = async (params: {
  workspaceId: string
  modelProvider: ModelProvider
  eventType: 'call' | 'response'
  providerInstanceId: string
  modelNames: string[]
  maxPendingMessages: number
}) => {
  const { workspaceId, modelProvider, providerInstanceId, modelNames, maxPendingMessages, eventType } = params
  const consumerName = getBatchConsumerName({ workspaceId, modelProvider, providerInstanceId, eventType })
  const subjectFilters = getBatchConsumerSubjectFilters({ workspaceId, modelProvider, modelNames, eventType })
  await eventClient.ensureConsumer({
    streamName: MODEL_CALLS_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 3 * 60 * 1000,
    maxDeliveryAttempts: 5,
    maxPendingMessages,
  })
}

export const deleteProviderInstanceConsumer = async (params: {
  workspaceId: string
  modelProvider: ModelProvider
  eventType: 'call' | 'response'
  providerInstanceId: string
}) => {
  const { workspaceId, modelProvider, providerInstanceId, eventType } = params
  const consumerName = getBatchConsumerName({ workspaceId, modelProvider, providerInstanceId, eventType })
  await eventClient.deleteConsumer({ streamName: MODEL_CALLS_STREAM_NAME, consumerName })
}
