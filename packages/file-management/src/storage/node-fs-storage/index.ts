import { IStorageService } from '../storage-interface'
import { createLibrary } from './create-library'
import { createWorkspace } from './create-workspace'
import { deleteFiles } from './delete-files'
import { exists } from './exists'
import { getExtraction } from './get-extraction'
import { getFile } from './get-file'
import { getLibrary } from './get-library'
import { getWorkspace } from './get-workspace'
import { moveLibrary } from './move-library'
import { readExtraction } from './read-extraction'
import { readSource } from './read-source'
import { reconcile } from './reconcile'
import { updateLibrary } from './update-library'
import { upgradeLegacyFile } from './upgrade-legacy-file'
import { upgradeLegacyLibrary } from './upgrade-legacy-library'
import { writeExtraction } from './write-extraction'
import { writeSource } from './write-source'

const nodeStorage: IStorageService = {
  exists,
  createWorkspace,
  getWorkspace,
  createLibrary,
  updateLibrary,
  getLibrary,
  moveLibrary,
  writeSource,
  readSource,
  getFile,
  writeExtraction,
  readExtraction,
  getExtraction,
  deleteFiles,
  reconcile,
  upgradeLegacyFile,
  upgradeLegacyLibrary,
}

export default nodeStorage
