import { eventClient } from '../client'
import { WORKSPACE_PROCESSING_STREAM_SUBJECTS, WORKSPACE_STREAM_NAME } from './common'
import {
  deleteWorkspaceProcessingConsumers,
  ensureWorkspaceProcessingConsumer,
  ensureWorkspaceProcessingConsumers,
} from './consumers'
import { EVENT_PROCESSING_STATUS, processingStatus, startProcessing, stopProcessing } from './controller'
import { publishRequestEvent, publishStatusEvent } from './publish'
import { EmbeddingRequestSchema, EnrichmentRequestSchema, ExtractionRequestSchema, PROCESS_TYPES } from './schema'
import { getWorkspaceProcessStatistics, getWorkspaceStatistics } from './statistics'
import { subscribeProcessEvent } from './subscribe'

export type {
  ProcessEvent,
  ProcessType,
  StatusEvent,
  EmbeddingRequest,
  ExtractionRequest,
  EnrichmentRequest,
} from './schema'

export const initializeWorkspaceProcessingStream = async () => {
  await eventClient.ensureStream({
    streamName: WORKSPACE_STREAM_NAME,
    description: `Events for workspace processings like embed, extract, enrich`,
    subjects: WORKSPACE_PROCESSING_STREAM_SUBJECTS,
    persist: true,
  })
  return WORKSPACE_STREAM_NAME
}

export default {
  stopProcessing,
  startProcessing,
  processingStatus,
  deleteWorkspaceProcessingConsumers,
  ensureWorkspaceProcessingConsumer,
  ensureWorkspaceProcessingConsumers,
  publishRequestEvent,
  publishStatusEvent,
  subscribeProcessEvent,
  getWorkspaceProcessStatistics,
  getWorkspaceStatistics,
  EVENT_PROCESSING_STATUS,
  PROCESS_TYPES,
  EmbeddingRequestSchema,
  ExtractionRequestSchema,
  EnrichmentRequestSchema,
}
