import { PROCESSING_REQUEST_TYPES, ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName, getConsumerNames, getConsumerSubjectFilters, logger } from './common'

export const ensureWorkspaceConsumer = async (params: { workspaceId: string; requestType: ProcessingRequestType }) => {
  const { workspaceId, requestType } = params
  const consumerName = getConsumerName({ workspaceId, requestType })
  const subjectFilters = getConsumerSubjectFilters({ workspaceId, requestType })
  await eventClient.ensureConsumer({
    streamName: WORKSPACE_STREAM_NAME,
    consumerName,
    subjectFilters,
    maxDeliveryAttempts: 3,
    timeoutMs: 5 * 60 * 1000,
    maxPendingMessages: 10000,
  })
}

export const ensureWorkspaceConsumers = async ({ workspaceId }: { workspaceId: string }) => {
  await Promise.all(
    Object.values(PROCESSING_REQUEST_TYPES).map(async (requestType) => {
      await ensureWorkspaceConsumer({
        workspaceId,
        requestType,
      })
    }),
  )
}

export const deleteWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
  const consumerNames = getConsumerNames({ workspaceId })
  const settled = await Promise.allSettled(
    consumerNames.map(async (consumerName) => {
      await eventClient
        .deleteConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
        .then(() => {
          logger.info('Deleted consumer during workspace cleanup', { consumerName, workspaceId })
        })
        .catch((error) => {
          // Log and ignore errors during cleanup
          logger.info('Error deleting consumer during cleanup', { error, consumerName, workspaceId })
        })
    }),
  )

  const rejected = settled.filter((result) => result.status === 'rejected')
  if (rejected.length > 0) {
    logger.warn('Some consumers failed to delete during workspace cleanup', {
      workspaceId,
      failedCount: rejected.length,
    })
  } else {
    logger.info('Successfully deleted all consumers for workspace', { workspaceId })
  }
}
