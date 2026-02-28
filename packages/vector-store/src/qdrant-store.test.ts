import { vectorStore } from '.'
import { createWorkspace, getChunks, removeWorkspace, upsertChunks, upsertEmbeddings } from './qdrant-store'
import { FileChunk, VectorStoreChunk } from './schema'

describe.sequential('Vector Store with Qdrant  ', () => {
  const TEST_WORKSPACE_ID = `test-workspace-qdrant-store_${Date.now()}`
  const TEST_VECTOR_DEFINITIONS = {
    testModel: {
      size: 3,
      distance: 'Cosine' as const,
    },
  }
  afterAll(async () => {
    await removeWorkspace(TEST_WORKSPACE_ID)
  })
  it(
    'should create store for workspace',
    { timeout: 20000 }, // Workspace creation is slow in Qdrant
    async () => {
      await createWorkspace({ workspaceId: TEST_WORKSPACE_ID, vectors: TEST_VECTOR_DEFINITIONS })
    },
  )
  it('should store chunks', async () => {
    const chunks: VectorStoreChunk[] = [
      {
        id: 'chunk1',
        libraryId: 'lib1',
        fileId: 'file1',
        extractionMethod: 'textExtraction',
        chunk: 0,
        content: 'This is a test chunk 1',
        filename: 'testfile.md',
      },
      {
        id: 'chunk2',
        libraryId: 'lib1',
        fileId: 'file1',
        extractionMethod: 'textExtraction',
        chunk: 1,
        content: 'This is a test chunk 2',
        filename: 'testfile.md',
      },
    ]
    await upsertChunks({ workspaceId: TEST_WORKSPACE_ID, chunks })
  })
  it('should retrieve stored chunks', async () => {
    const retrievedChunks = await new Promise<FileChunk[]>((resolve) => {
      const interval = setInterval(async () => {
        const chunks = await getChunks({
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib1',
          fileId: 'file1',
          extractionMethod: 'textExtraction',
          take: 10,
          skip: 0,
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
    await vectorStore
      .createWorkspace({ workspaceId: TEST_WORKSPACE_ID, vectors: TEST_VECTOR_DEFINITIONS })
      .catch((error) => {
        expect(error).toBeDefined()
      })
  })
  it('add vectors to chunks', async () => {
    const embeddings = [
      { chunk: 0, vector: [0.1, 0.2, 0.3] },
      { chunk: 1, vector: [0.4, 0.5, 0.6] },
    ]
    await upsertEmbeddings({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: 'lib1',
      fileId: 'file1',
      extractionMethod: 'textExtraction',
      embeddingModelName: 'testModel',
      embeddings,
    })
  })
  it('should retrieve chunks with embeddings', async () => {
    const retrievedChunks = await getChunks({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: 'lib1',
      fileId: 'file1',
      extractionMethod: 'textExtraction',
      take: 10,
      skip: 0,
    })
    expect(retrievedChunks.length).toBe(2)
    const sortedChunks = retrievedChunks.sort((a, b) => a.chunk - b.chunk)
    expect(sortedChunks[0].embeddingModelNames).toContain('testModel')
    expect(sortedChunks[1].embeddingModelNames).toContain('testModel')
  })
})
