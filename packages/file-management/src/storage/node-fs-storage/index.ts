import { IStorageService } from '../storage-interface'
import { createLibrary } from './create-library'
import { createWorkspace } from './create-workspace'
import { deleteFile } from './delete-file'
import { getWorkspaceManifest } from './metadata-files'
import { moveLibrary } from './move-library'
import { readExtraction } from './read-extraction'
import { readSource } from './read-source'
import { reconcile } from './reconcile'
import { updateLibrary } from './update-library'
import { writeExtraction } from './write-extraction'
import { writeSource } from './write-source'

const nodeStorage: IStorageService = {
  createWorkspace,
  getWorkspaceManifest,
  createLibrary,
  updateLibrary,
  moveLibrary,
  writeSource,
  readSource,
  writeExtraction,
  readExtraction,
  deleteFile,
  reconcile,
}

export default nodeStorage
