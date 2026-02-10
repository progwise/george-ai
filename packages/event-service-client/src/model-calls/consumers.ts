import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { MODEL_CALLS_STREAM_NAME, getConsumerName, getConsumerSubjectFilters } from './common'

export const ensureModelCallConsumer = async (params: {
  workspaceId: string
  modelProvider: ModelProvider
  eventType: 'call' | 'response'
  providerInstanceId: string
  modelNames: string[]
  maxPendingMessages: number
}) => {
  const { workspaceId, modelProvider, providerInstanceId, modelNames, maxPendingMessages, eventType } = params
  const consumerName = getConsumerName({ workspaceId, modelProvider, providerInstanceId, eventType })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, modelProvider, modelNames, eventType })
  await eventClient.ensureConsumer({
    streamName: MODEL_CALLS_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 3 * 60 * 1000,
    maxDeliveryAttempts: 5,
    maxPendingMessages,
  })
}

export const deleteModelCallConsumer = async (params: {
  workspaceId: string
  modelProvider: ModelProvider
  eventType: 'call' | 'response'
  providerInstanceId: string
}) => {
  const { workspaceId, modelProvider, providerInstanceId, eventType } = params
  const consumerName = getConsumerName({ workspaceId, modelProvider, providerInstanceId, eventType })
  await eventClient.deleteConsumer({ streamName: MODEL_CALLS_STREAM_NAME, consumerName })
}
