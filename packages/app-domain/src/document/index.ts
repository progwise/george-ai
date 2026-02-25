import { createDocument } from './create-document'
import { fixMissingDocumentManifest } from './fix-missing-document-manifest'
import { getDocumentManifest } from './get-document-manifest'
import { getExtraction } from './get-extraction'
import { getExtractionMethods } from './get-extraction-methods'
import { getSourceHash } from './get-source-hash'
import { prepareUpload } from './prepare-upload'
import { readActiveExtractions } from './reac-active-extractions'
import { readExtraction } from './read-extraction'
import { readSource } from './read-source'
import { saveDocument } from './save-document'
import { transform } from './transform'
import { uploadDocumentSource } from './upload-document-source'

export {
  createDocument,
  getDocumentManifest,
  getExtraction,
  getExtractionMethods,
  getSourceHash,
  prepareUpload,
  readActiveExtractions,
  readExtraction,
  readSource,
  transform,
  uploadDocumentSource,
  saveDocument,
  fixMissingDocumentManifest,
}

export default {
  createDocument,
  getDocumentManifest,
  getExtraction,
  getExtractionMethods,
  getSourceHash,
  prepareUpload,
  readActiveExtractions,
  readExtraction,
  readSource,
  transform,
  uploadDocumentSource,
  saveDocument,
  fixMissingDocumentManifest,
}
