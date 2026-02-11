import { PROCESSING_REQUEST_TYPES, ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName, getConsumerNames, getConsumerSubjectFilters, logger } from './common'

export const ensureWorkspaceConsumer = async (params: {
  workspaceId: string
  requestType: ProcessingRequestType
  timeoutMs: number
  maxPendingMessages: number
  maxDeliveryAttempts: number
}) => {
  const { workspaceId, requestType, maxPendingMessages, maxDeliveryAttempts } = params
  const consumerName = getConsumerName({ workspaceId, requestType })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, requestType })
  await eventClient.ensureConsumer({
    streamName: WORKSPACE_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 5 * 60 * 1000,
    maxPendingMessages,
    maxDeliveryAttempts,
  })
}

export const ensureWorkspaceConsumers = async ({ workspaceId }: { workspaceId: string }) => {
  await Promise.all(
    Object.values(PROCESSING_REQUEST_TYPES).map(async (requestType) => {
      await ensureWorkspaceConsumer({
        workspaceId,
        requestType,
        maxDeliveryAttempts: 3,
        timeoutMs: 5 * 60 * 1000,
        maxPendingMessages: 10000,
      })
    }),
  )
}

export const deleteWorkspaceProcessingConsumers = async ({ workspaceId }: { workspaceId: string }) => {
  const consumerNames = getConsumerNames({ workspaceId })
  await Promise.all(
    consumerNames.map(async (consumerName) => {
      await eventClient.deleteConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName }).catch((error) => {
        // Log and ignore errors during cleanup
        logger.info('Error deleting consumer during cleanup', { error, consumerName, workspaceId })
      })
    }),
  )
}
