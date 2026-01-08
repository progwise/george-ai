import { afterAll } from 'vitest'

import { deleteCollection, ensureCollection, getCollections } from './qdrant-client'

const TEST_COLLECTION_NAME = 'test-collection'

describe('QdrantClient', () => {
  afterAll(async () => {
    // Clean up test collections
    try {
      await deleteCollection(TEST_COLLECTION_NAME)
      console.log(`Deleted test collection: ${TEST_COLLECTION_NAME}`)
    } catch (error) {
      console.log('Error deleting test collection (might not exist):', error)
    }
  })

  it('should get collections', async () => {
    const collections = await getCollections()
    expect(collections).toBeDefined()
  })

  it('should create a collection if it does not exist', async () => {
    await ensureCollection(TEST_COLLECTION_NAME, 128)

    const updatedCollections = await getCollections()
    const updatedCollectionNames = updatedCollections.collections.map((col) => col.name)
    expect(updatedCollectionNames).toContain(TEST_COLLECTION_NAME)
  })
})
