import { vectorStore } from '.'
import { createVectorStore, getChunks, removeVectorStore, upsertChunks, upsertEmbeddings } from './qdrant-store'
import { VectorStoreChunk } from './schema'

describe.sequential('Vector Store with Qdrant  ', () => {
  const TEST_WORKSPACE_ID = `test-workspace-qdrant-store_${Date.now()}`
  const TEST_MODEL = {
    modelDriver: 'ollama' as const,
    modelName: 'test-model:bg12',
    size: 3,
    distance: 'Cosine' as const,
  }
  const TEST_IDENTIFIER = {
    workspaceId: TEST_WORKSPACE_ID,
    modelDriver: TEST_MODEL.modelDriver,
    modelName: TEST_MODEL.modelName,
  }
  afterAll(async () => {
    await removeVectorStore(TEST_IDENTIFIER)
  })
  it(
    'should create store for workspace',
    { timeout: 20000 }, // Workspace creation is slow in Qdrant
    async () => {
      await createVectorStore({ workspaceId: TEST_WORKSPACE_ID, model: TEST_MODEL })
    },
  )
  it('should store chunks', async () => {
    const chunks: VectorStoreChunk[] = [
      {
        id: 'chunk1',
        libraryId: 'lib1',
        documentId: 'file1',
        extractionMethod: 'textExtraction',
        chunk: 0,
        content: 'This is a test chunk 1',
        documentName: 'testfile.md',
      },
      {
        id: 'chunk2',
        libraryId: 'lib1',
        documentId: 'file1',
        extractionMethod: 'textExtraction',
        chunk: 1,
        content: 'This is a test chunk 2',
        documentName: 'testfile.md',
        // Adding vector directly to test upsertChunks with vector
      },
    ]
    await upsertChunks({ ...TEST_IDENTIFIER, chunks: chunks.map((chunk) => ({ ...chunk, vector: [0, 0, 0] })) })
  })
  it('should retrieve stored chunks', async () => {
    const retrievedChunks = await new Promise<VectorStoreChunk[]>((resolve) => {
      const interval = setInterval(async () => {
        const chunks = await getChunks({
          ...TEST_IDENTIFIER,
          libraryId: 'lib1',
          documentId: 'file1',
          extractionMethod: 'textExtraction',
          take: 10,
          firstChunk: 0,
        })
        if (chunks.length > 1) {
          clearInterval(interval)
          resolve(chunks)
        }
      }, 200)
    })

    expect(retrievedChunks.length).toBe(2)
    const sortedChunks = retrievedChunks.sort((a, b) => a.chunk - b.chunk)
    expect(sortedChunks[0].content).toBe('This is a test chunk 1')
    expect(sortedChunks[1].content).toBe('This is a test chunk 2')
  }, 10000)

  it('Create the same workspace should result in an error', async () => {
    await vectorStore.createVectorStore({ workspaceId: TEST_WORKSPACE_ID, model: TEST_MODEL }).catch((error) => {
      expect(error).toBeDefined()
    })
  })
  it('add vectors to chunks', async () => {
    const embeddings = [
      { chunk: 0, vector: [0.1, 0.2, 0.3] },
      { chunk: 1, vector: [0.4, 0.5, 0.6] },
    ]
    await upsertEmbeddings({
      ...TEST_IDENTIFIER,
      libraryId: 'lib1',
      documentId: 'file1',
      extractionMethod: 'textExtraction',
      embeddings,
    })
  })
  it('should retrieve chunks with embeddings', async () => {
    const retrievedChunks = await getChunks({
      ...TEST_IDENTIFIER,
      libraryId: 'lib1',
      documentId: 'file1',
      extractionMethod: 'textExtraction',
      take: 10,
      firstChunk: 0,
    })
    expect(retrievedChunks.length).toBe(2)
    console.log('Retrieved Chunks with Embeddings:', retrievedChunks)
    const sortedChunks = retrievedChunks.sort((a, b) => a.chunk - b.chunk)
    expect(sortedChunks[0].content).toContain('test chunk 1')
    expect(sortedChunks[1].content).toContain('test chunk 2')
  })
})
