import { vectorStoreClient } from './client'

export type { VectorModelMap, VectorStoreClient, VectorStoreFilesSelector } from './client'
export { vectorStoreClient }

export {
  VectorStoreDocumentSchema,
  VectorStoreDocumentIdentifierSchema,
  type VectorStoreDocument,
  type VectorStoreDocumentIdentifier,
} from './schema'
