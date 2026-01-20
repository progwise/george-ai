import { QdrantClientImplementation } from './qdrant-client'
import { VectorStoreClient } from './vector-store-client'

/* Export only the interface, not the implementation */
export type { VectorStoreFilesSelector, VectorModelMap, VectorStoreClient } from './vector-store-client'

const createVectorStoreClient = (): VectorStoreClient => {
  return new QdrantClientImplementation()
}

export const vectorStoreClient = createVectorStoreClient()
