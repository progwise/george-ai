import { SYSTEM_WORKSPACE_ID } from './common'
import { createWorkspace } from './create-workspace'
import { deleteFiles } from './delete-files'
import { deleteLibrary } from './delete-library'
import { deleteWorkspace } from './delete-workspace'
import { getContentHash } from './get-content-hash'
import { FileInfo, getFileInfo } from './get-file-info'
import { getModelProvider } from './get-model-provider'
import { getSourceFileHash } from './get-source-file-hash'
import { getStats } from './get-stats'
import { getWorkspaceId } from './get-workspace-id'
import { markUploadFinished } from './mark-upload-finished'
import { migrateWorkspace } from './migrate-workspace'
import { processFile } from './process-file'
import { processFiles } from './process-files'
import { saveSourceFile } from './save-source-file'
import { workspaceNeedsMigration } from './workspace-needs-migration'

export type { FileInfo }
export default {
  createWorkspace,
  deleteWorkspace,
  deleteLibrary,
  deleteFiles,
  getFileInfo,
  getModelProvider,
  getStats,
  getWorkspaceId,
  markUploadFinished,
  saveSourceFile,
  getSourceFileHash,
  getContentHash,
  processFile,
  processFiles,
  migrateWorkspace,
  workspaceNeedsMigration,
  SYSTEM_WORKSPACE_ID,
}
