import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName, getConsumerNames, getConsumerSubjectFilters, logger } from './common'
import { PROCESS_TYPES, ProcessType } from './schema'

export const ensureWorkspaceProcessingConsumer = async (params: {
  workspaceId: string
  processType: ProcessType
  timeoutMs: number
  maxPendingMessages: number
  maxDeliveryAttempts: number
}) => {
  const { workspaceId, processType, maxPendingMessages, maxDeliveryAttempts } = params
  const consumerName = getConsumerName({ workspaceId, processType })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, processType })
  await eventClient.ensureConsumer({
    streamName: WORKSPACE_STREAM_NAME,
    consumerName,
    subjectFilters,
    timeoutMs: 5 * 60 * 1000,
    maxPendingMessages,
    maxDeliveryAttempts,
  })
}

export const ensureWorkspaceProcessingConsumers = async ({
  workspaceId,
}: {
  workspaceId: string
  maxPendingMessages: number
}) => {
  await Promise.all(
    Object.values(PROCESS_TYPES).map(async (processType) => {
      await ensureWorkspaceProcessingConsumer({
        workspaceId,
        processType,
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
