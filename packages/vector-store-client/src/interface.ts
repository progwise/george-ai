import { VectorStoreChunk, VectorStoreChunksSelector } from './schema'

export interface VectorStore {
  createWorkspace(parameters: {
    workspaceId: string
    vectors: {
      [modelName: string]: {
        size: number
        distance: 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan'
      }
    }
  }): Promise<void>
  removeWorkspace(workspaceId: string): Promise<void>
  getEmbeddingModelNames(workspaceId: string): Promise<string[]>

  getChunkCount(parameters: {
    workspaceId: string
    libraryId?: string
    fileId?: string
    extractionMethod?: string | null
  }): Promise<number>

  upsertChunks(parameters: { workspaceId: string; chunks: VectorStoreChunk[] }): Promise<void>

  removeChunks(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string
    extractionMethod?: string | null
  }): Promise<void>

  getChunks(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string
    extractionMethod?: string | null
    take: number
    skip: number
  }): Promise<(VectorStoreChunk & { embeddingModelNames: string[] })[]>

  readChunks(params: {
    workspaceId: string
    libraryId: string
    fileId: string
    extractionMethod?: string | null
  }): AsyncIterable<(VectorStoreChunk & { embeddingModelNames: string[] })[]>

  upsertEmbeddings(parameters: {
    workspaceId: string
    libraryId: string
    fileId: string
    extractionMethod: string
    fileFragment?: number | null
    embeddingModelName: string
    embeddings: Array<{ chunk: number; vector: number[] }>
  }): Promise<void>

  removeEmbeddings(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string | null
    extractionMethod?: string | null
    embeddingModelName?: string | null
  }): Promise<void>

  findSimilarChunks(parameters: {
    workspaceId: string
    libraryId?: string
    fileId?: string
    extractionMethod?: string | null
    fragment?: number | null
    embeddingModelName: string
    vector: number[]
    topK: number
    maxDistance?: number
  }): Promise<{ results: Array<{ chunk: VectorStoreChunk; distance: number }> }>

  queryChunks(parameters: {
    workspaceId: string
    selector: VectorStoreChunksSelector
    take: number
    skip: number
  }): Promise<{ hitCount: number; results: Array<VectorStoreChunk> }>
}
