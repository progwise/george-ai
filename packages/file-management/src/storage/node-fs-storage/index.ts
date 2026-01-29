import { IStorageService } from '../storage-interface'
import { createExtraction } from './create-extraction'
import { createLibrary } from './create-library'
import { createWorkspace } from './create-workspace'
import { deleteFiles } from './delete-files'
import { deleteLibrary } from './delete-library'
import { deleteWorkspace } from './delete-workspace'
import { exists } from './exists'
import { getAttachmentFilePath } from './get-attachment-filepath'
import { getExtraction } from './get-extraction'
import { getFile } from './get-file'
import { getLibrary } from './get-library'
import { getWorkspace } from './get-workspace'
import { moveLibrary } from './move-library'
import { readAttachment } from './read-attachment'
import { readExtraction } from './read-extraction'
import { readSource } from './read-source'
import { reconcile } from './reconcile'
import { updateLibrary } from './update-library'
import { upgradeLegacyFile } from './upgrade-legacy-file'
import { upgradeLegacyLibrary } from './upgrade-legacy-library'
import { writeSource } from './write-source'

const nodeStorage: IStorageService = {
  exists,
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  createLibrary,
  deleteLibrary,
  updateLibrary,
  getLibrary,
  moveLibrary,
  writeSource,
  readSource,
  getFile,
  createExtraction,
  readExtraction,
  getExtraction,
  readAttachment,
  getAttachmentFilePath,
  deleteFiles,
  reconcile,
  upgradeLegacyFile,
  upgradeLegacyLibrary,
}

export default nodeStorage
