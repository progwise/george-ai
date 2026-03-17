import { QdrantClient } from '@qdrant/js-client-rest'
import { v5 as uuidv5 } from 'uuid'

import { createLogger } from '@george-ai/app-commons'

import { VectorStoreChunkIdentifier } from '../schema'

export const logger = createLogger('VectorStoreClient:QdrantClient')

const GEORGE_AI_NAMESPACE_UUID = 'd290f1ee-6c54-4b01-90e6-d701748f0851'

export const getCollectionName = (workspaceId: string) => `workspace_${workspaceId}`
export const getChunkIdentifier = (document: VectorStoreChunkIdentifier): string => {
  const fragmentPart = document.fragment !== null ? `_fragment${document.fragment}` : ''
  const idString = `library${document.libraryId}_file${document.documentId}${fragmentPart}_chunk${document.chunk}`
  return uuidv5(idString, GEORGE_AI_NAMESPACE_UUID)
}

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://gai-qdrant:6333',
  apiKey: process.env.QDRANT_API_KEY || 'Test123',
})

export const getCollection = async (collectionName: string) => {
  const { exists } = await qdrantClient.collectionExists(collectionName)
  if (!exists) {
    return null
  }
  return await qdrantClient.getCollection(collectionName)
}
