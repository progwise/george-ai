import { SYSTEM_WORKSPACE_ID } from './common'
import { createWorkspace } from './create-workspace'
import { deleteFiles } from './delete-files'
import { deleteLibrary } from './delete-library'
import { deleteWorkspace } from './delete-workspace'
import { getContentHash } from './get-content-hash'
import { getFileInfo } from './get-file-info'
import { getModelProvider } from './get-model-provider'
import { getSourceFileHash } from './get-source-file-hash'
import { getWorkspaceId } from './getWorkspaceId'
import { markUploadFinished } from './mark-upload-finished'
import { migrateWorkspace } from './migrate-workspace'
import { processFile } from './process-file'
import { processFiles } from './process-files'
import { saveSourceFile } from './save-source-file'

export default {
  createWorkspace,
  deleteWorkspace,
  deleteLibrary,
  deleteFiles,
  getModelProvider,
  markUploadFinished,
  saveSourceFile,
  getSourceFileHash,
  getContentHash,
  processFile,
  processFiles,
  migrateWorkspace,
  getFileInfo,
  getWorkspaceId,
  SYSTEM_WORKSPACE_ID,
}
