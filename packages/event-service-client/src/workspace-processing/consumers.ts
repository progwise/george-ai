import { eventClient } from '../client'
import {
  ACTION_TYPES,
  ActionType,
  WORKSPACE_STREAM_NAME,
  getConsumerName,
  getConsumerNames,
  getConsumerSubjectFilters,
  logger,
} from './common'

export const ensureWorkspaceConsumer = async (params: {
  workspaceId: string
  actionType: ActionType
  timeoutMs: number
  maxPendingMessages: number
  maxDeliveryAttempts: number
}) => {
  const { workspaceId, actionType, maxPendingMessages, maxDeliveryAttempts } = params
  const consumerName = getConsumerName({ workspaceId, actionType })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, actionType })
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
    Object.values(ACTION_TYPES).map(async (actionType) => {
      await ensureWorkspaceConsumer({
        workspaceId,
        actionType,
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
