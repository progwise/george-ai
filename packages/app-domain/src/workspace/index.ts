import { create } from './create'
import { getUploadFileInfo, markUploadFinished } from './file-upload-info'
import { getWorkspaceIdFromLibrary } from './get-by-library'
import { getModelProvider } from './get-model-provider'
import { getStats } from './get-stats'
import { processFile } from './process-file'
import { processFiles } from './process-files'
import { upgradeFromLegacy } from './upgrade-from-legacy'

export default {
  create,
  getUploadFileInfo,
  getModelProvider,
  getStats,
  getWorkspaceIdFromLibrary,
  markUploadFinished,
  processFile,
  processFiles,
  upgradeFromLegacy,
}
