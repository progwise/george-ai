import { workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

import { getFileInfo } from './file-info'
import { getUploadFileInfo, markUploadFinished } from './file-upload-info'
import { getWorkspaceIdFromLibrary } from './get-by-library'
import { getProcessingStatus, startProcessing, stopProcessing } from './processing'
import { triggerEmbeddingEvent } from './processing-event'
import { getWorkspaceStatistics } from './statistics'
import { getWorkers } from './workers'

export type { ProcessType, ProcessEvent, EmbeddingRequest } from '@george-ai/event-service-client'

export default {
  startProcessing,
  stopProcessing,
  triggerEmbeddingEvent,
  getFileInfo,
  getUploadFileInfo,
  getProcessingStatus,
  getWorkers,
  getWorkspaceStatistics,
  getWorkspaceIdFromLibrary,
  markUploadFinished,
  PROCESS_TYPES: workspaceProcessing.PROCESS_TYPES,
  WORKER_TYPES: workerRegistry.WORKER_TYPES,
  EVENT_PROCESSING_STATUS: workspaceProcessing.EVENT_PROCESSING_STATUS,
}
