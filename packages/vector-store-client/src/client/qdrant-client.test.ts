import { afterAll } from 'vitest'

import { QdrantClientImplementation } from './qdrant-client'

describe('QdrantClient', () => {
  const TEST_WORKSPACE_ID = `test_workspace_${Date.now()}`
  const TEST_COLLECTION_NAME = `workspace_${TEST_WORKSPACE_ID}`
  const qdrantClient = new QdrantClientImplementation()

  afterAll(async () => {
    await qdrantClient['client'].deleteCollection(TEST_COLLECTION_NAME).catch(() => {
      // Ignore if collection does not exist
    })
  })

  it('should get collections', async () => {
    const collections = await qdrantClient['client'].getCollections()
    expect(collections).toBeDefined()
  })

  it('should create a collection if it does not exist', async () => {
    await qdrantClient.ensureWorkspace(TEST_WORKSPACE_ID)

    const updatedCollections = await qdrantClient['client'].getCollections()
    const updatedCollectionNames = updatedCollections.collections.map((col) => col.name)
    expect(updatedCollectionNames).toContain(TEST_COLLECTION_NAME)
  })
})
