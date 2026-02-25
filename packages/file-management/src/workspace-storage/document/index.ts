import { calculateSourceHash } from './calculate-source-hash'
import { createDocument } from './create-document'
import { deleteDocument, deleteDocumentEx } from './delete-document'
import { existsDocument } from './exists-document'
import { getDocument, getDocumentOrThrow } from './get-document'
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
  getOrThrow: getDocumentOrThrow,
  getSourcePath,
  getSourceSize,
  save: saveDocument,
  readSource: readSourceEx,
  writeSource: writeSourceEx,
  existsDocument,
}

export {
  calculateSourceHash,
  createDocument,
  deleteDocument,
  deleteDocumentEx,
  existsDocument,
  getDocument,
  getDocumentOrThrow,
  getSourcePath,
  getSourceSize,
  readSource,
  readSourceEx,
  saveDocument,
  writeSource,
  writeSourceEx,
}
