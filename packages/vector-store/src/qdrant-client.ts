import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://gai-qdrant:6333',
  apiKey: process.env.QDRANT_API_KEY || undefined,
})

export const getCollections = async () => {
  return await client.getCollections()
}

export const getCollection = async (collectionName: string) => {
  return await client.getCollection(collectionName)
}

export const ensureCollection = async (collectionName: string, vectorSize: number) => {
  const { exists } = await client.collectionExists(collectionName)
  if (exists) {
    return
  }

  // Create collection
  await client.createCollection(collectionName, {
    vectors: {
      size: vectorSize,
      distance: 'Cosine',
    },
  })
}

export const deleteCollection = async (collectionName: string) => {
  await client.deleteCollection(collectionName)
}
