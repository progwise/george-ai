import { PROCESSING_REQUEST_TYPES, ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName, logger } from './common'
import { ensureWorkspaceConsumer } from './consumers'

export const stopProcessing = async ({
  workspaceId,
  requestTypes,
}: {
  workspaceId: string
  requestTypes?: ProcessingRequestType[]
}) => {
  if (!requestTypes) {
    requestTypes = PROCESSING_REQUEST_TYPES.map((type) => type as ProcessingRequestType)
  }
  await Promise.all(
    requestTypes.map(async (requestType) => {
      await ensureWorkspaceConsumer({ workspaceId, requestType })
      const consumerName = getConsumerName({ workspaceId, requestType })
      await eventClient.pauseConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
    }),
  )
  logger.debug('Processing stopped for all request types', { workspaceId, requestTypes })
}

export const startProcessing = async ({
  workspaceId,
  requestTypes,
}: {
  workspaceId: string
  requestTypes?: ProcessingRequestType[]
}) => {
  if (!requestTypes) {
    requestTypes = PROCESSING_REQUEST_TYPES.map((type) => type as ProcessingRequestType)
  }
  await Promise.all(
    requestTypes.map(async (requestType) => {
      await ensureWorkspaceConsumer({ workspaceId, requestType })
      const consumerName = getConsumerName({ workspaceId, requestType })
      await eventClient.resumeConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
    }),
  )
  logger.debug('Processing started for all request types', { workspaceId, requestTypes })
}

export const EVENT_PROCESSING_STATUS = ['paused', 'running'] as const

export type EventProcessingStatus = (typeof EVENT_PROCESSING_STATUS)[number]

export const processingStatus = async ({
  workspaceId,
  requestType,
}: {
  workspaceId: string
  requestType: ProcessingRequestType
}): Promise<EventProcessingStatus> => {
  await ensureWorkspaceConsumer({ workspaceId, requestType })
  const consumerName = getConsumerName({ workspaceId, requestType })
  return await eventClient.consumerStatus({ streamName: WORKSPACE_STREAM_NAME, consumerName })
}
