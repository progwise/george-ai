import { eventClient } from '../client'
import { ACTION_TYPES, ActionType, WORKSPACE_STREAM_NAME, getConsumerName, logger } from './common'

export const stopProcessing = async ({
  workspaceId,
  actionTypes,
}: {
  workspaceId: string
  actionTypes?: ActionType[]
}) => {
  if (!actionTypes) {
    actionTypes = ACTION_TYPES.map((type) => type as ActionType)
  }
  await Promise.all(
    actionTypes.map(async (actionType) => {
      const consumerName = getConsumerName({ workspaceId, actionType })
      await eventClient.pauseConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
    }),
  )
  logger.debug('Processing stopped for all action types', { workspaceId, actionTypes })
}

export const startProcessing = async ({
  workspaceId,
  actionTypes,
}: {
  workspaceId: string
  actionTypes?: ActionType[]
}) => {
  if (!actionTypes) {
    actionTypes = ACTION_TYPES.map((type) => type as ActionType)
  }
  await Promise.all(
    actionTypes.map(async (actionType) => {
      const consumerName = getConsumerName({ workspaceId, actionType })
      await eventClient.resumeConsumer({ streamName: WORKSPACE_STREAM_NAME, consumerName })
    }),
  )
  logger.debug('Processing started for all action types', { workspaceId, actionTypes })
}

export const EVENT_PROCESSING_STATUS = ['paused', 'running'] as const

export type EventProcessingStatus = (typeof EVENT_PROCESSING_STATUS)[number]

export const processingStatus = async ({
  workspaceId,
  actionType,
}: {
  workspaceId: string
  actionType: ActionType
}): Promise<EventProcessingStatus> => {
  const consumerName = getConsumerName({ workspaceId, actionType })
  return await eventClient.consumerStatus({ streamName: WORKSPACE_STREAM_NAME, consumerName })
}
