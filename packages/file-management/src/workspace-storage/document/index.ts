import { calculateSourceHash } from './calculate-source-hash'
import { createDocument } from './create-document'
import { deleteDocument, deleteDocumentEx } from './delete-document'
import { exists } from './exists'
import { getDocument } from './get-document'
import { getSourcePath } from './get-source-path'
import { getSourceSize } from './get-source-size'
import { readSource, readSourceEx } from './read-source'
import { saveDocument } from './save-document'
import { writeSource, writeSourceEx } from './write-source'

export default {
  calculateSourceHash,
  create: createDocument,
  delete: deleteDocumentEx,
  get: getDocument,
  getSourcePath,
  getSourceSize,
  save: saveDocument,
  readSource: readSourceEx,
  writeSource: writeSourceEx,
  exists,
}

export {
  calculateSourceHash,
  createDocument,
  deleteDocument,
  deleteDocumentEx,
  getDocument,
  getSourcePath,
  getSourceSize,
  readSource,
  readSourceEx,
  saveDocument,
  writeSource,
  writeSourceEx,
}
