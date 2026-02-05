import { SYSTEM_WORKSPACE_ID } from './common'
import { createWorkspace } from './create-workspace'
import { deleteWorkspace } from './delete-workspace'
import { getUploadFileInfo, markUploadFinished } from './file-upload-info'
import { getWorkspaceIdFromLibrary } from './get-by-library'
import { getModelProvider } from './get-model-provider'
import { getStats } from './get-stats'
import { migrateWorkspace } from './migrate-workspace'
import { processFile } from './process-file'
import { processFiles } from './process-files'
import { workspaceNeedsMigration } from './workspace-needs-migration'

export default {
  createWorkspace,
  deleteWorkspace,
  getUploadFileInfo,
  getModelProvider,
  getStats,
  getWorkspaceIdFromLibrary,
  markUploadFinished,
  processFile,
  processFiles,
  migrateWorkspace,
  workspaceNeedsMigration,
  SYSTEM_WORKSPACE_ID,
}
