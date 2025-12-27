import { ensureCollection, getCollection, getCollections } from './qdrant-client'

describe('QdrantClient', () => {
  it('should get collections', async () => {
    const collections = await getCollections()
    expect(collections).toBeDefined()
  })

  it('should create a collection if it does not exist', async () => {
    const testCollectionName = 'test-collection'
    ensureCollection(testCollectionName, 128).then(async () => {
      const updatedCollections = await getCollections()
      const updatedCollectionNames = updatedCollections.collections.map((col) => col.name)
      expect(updatedCollectionNames).toContain(testCollectionName)
    })
  })

  it('should get a specific collection', async () => {
    const collectionName = 'test-collection'
    const collection = await getCollection(collectionName)
    expect(collection).toBeDefined()
  })
})
