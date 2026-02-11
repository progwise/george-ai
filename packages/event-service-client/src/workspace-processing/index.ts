import { eventClient } from '../client'
import { WORKSPACE_PROCESSING_STREAM_SUBJECTS, WORKSPACE_STREAM_NAME, getReplySubject } from './common'
import { deleteWorkspaceProcessingConsumers, ensureWorkspaceConsumer, ensureWorkspaceConsumers } from './consumers'
import { EVENT_PROCESSING_STATUS, processingStatus, startProcessing, stopProcessing } from './controller'
import { getRequests } from './get-requests'
import { publishProcessingRequest, publishProcessingStatus } from './publish'
import { ProcessingEventSchemas, ProcessingRequestSchema } from './schema'
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
export type * from './statistics'

export default {
  stopProcessing,
  startProcessing,
  processingStatus,
  deleteWorkspaceProcessingConsumers,
  ensureWorkspaceConsumer,
  ensureWorkspaceConsumers,
  publishProcessingRequest,
  publishProcessingStatus,
  subscribeEvent,
  getReplySubject,
  getRequests,
  getWorkspaceProcessStatistics,
  getWorkspaceStatistics,
  ProcessingEventSchemas,
  ProcessingRequestSchema,
  EVENT_PROCESSING_STATUS,
}
