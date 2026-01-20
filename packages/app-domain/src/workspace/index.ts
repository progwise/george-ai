import { workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

import { getFileInfo } from './file-info'
import { getUploadFileInfo, markUploadFinished } from './file-upload-info'
import { getWorkspaceIdFromLibrary } from './get-by-library'
import { startProcessing, stopProcessing } from './processing'
import { getWorkspaceStatistics } from './statistics'
import { getWorkerStatistics } from './workers'

export default {
  startProcessing,
  stopProcessing,
  getFileInfo,
  getUploadFileInfo,
  getWorkerStatistics,
  getWorkspaceStatistics,
  getWorkspaceIdFromLibrary,
  markUploadFinished,
  PROCESS_TYPES: workspaceProcessing.PROCESS_TYPES,
  WORKER_TYPES: workerRegistry.WORKER_TYPES,
}
