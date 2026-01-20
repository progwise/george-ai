import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName, logger } from './common'
import { ProcessType } from './schema'

export const stopProcessing = async ({
  workspaceId,
  processType,
}: {
  workspaceId: string
  processType: ProcessType
}) => {
  const consumerName = getConsumerName({ workspaceId, processType })
  await eventClient.pauseConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
  logger.debug('Processing stopped', { workspaceId, processType })
}

export const startProcessing = async ({
  workspaceId,
  processType,
}: {
  workspaceId: string
  processType: ProcessType
}) => {
  const consumerName = getConsumerName({ workspaceId, processType })
  await eventClient.resumeConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
  logger.debug('Processing started', { workspaceId, processType })
}

export const processingStatus = async ({
  workspaceId,
  processType,
}: {
  workspaceId: string
  processType: ProcessType
}) => {
  const consumerName = getConsumerName({ workspaceId, processType })
  return await eventClient.consumerStatus({ streamName: WORKSPACE_STREAM_NAME, consumerName })
}
