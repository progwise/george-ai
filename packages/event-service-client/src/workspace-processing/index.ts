import { eventClient } from '../client'
import { ACTION_TYPES, WORKSPACE_PROCESSING_STREAM_SUBJECTS, WORKSPACE_STREAM_NAME, getReplySubject } from './common'
import { deleteWorkspaceProcessingConsumers, ensureWorkspaceConsumer, ensureWorkspaceConsumers } from './consumers'
import { EVENT_PROCESSING_STATUS, processingStatus, startProcessing, stopProcessing } from './controller'
import { publishActionEvent, publishStatusEvent } from './publish'
import { ActionEventSchema, EventSchemas } from './schema'
import { getWorkspaceProcessStatistics, getWorkspaceStatistics } from './statistics'
import { subscribeEvent } from './subscribe'

export const initializeWorkspaceProcessingStream = async () => {
  await eventClient.ensureStream({
    streamName: WORKSPACE_STREAM_NAME,
    description: `Events for workspace processings like embed, extract, enrich`,
    subjects: WORKSPACE_PROCESSING_STREAM_SUBJECTS,
    persist: true,
  })
  return WORKSPACE_STREAM_NAME
}

export type * from './schema'
export type * from './common'

export default {
  stopProcessing,
  startProcessing,
  processingStatus,
  deleteWorkspaceProcessingConsumers,
  ensureWorkspaceConsumer,
  ensureWorkspaceConsumers,
  publishActionEvent,
  publishStatusEvent,
  subscribeEvent,
  getReplySubject,
  getWorkspaceProcessStatistics,
  getWorkspaceStatistics,
  EventSchemas,
  ActionEventSchema,
  ACTION_TYPES,
  EVENT_PROCESSING_STATUS,
}
