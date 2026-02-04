import { EmbeddingStatus } from '@george-ai/app-commons'
import { ExtractionMethod } from '@george-ai/app-commons/src/types/extraction'

import { VectorStoreChunk, VectorStoreChunksSelector } from './schema'

export interface EmbeddingInfo {
  extractionMethod: ExtractionMethod
  modelName: string
  chunkCount: number
}

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
  existsWorkspace(workspaceId: string): Promise<boolean>
  getEmbeddingModelNames(workspaceId: string): Promise<string[]>

  getChunkCount(parameters: {
    workspaceId: string
    libraryId?: string
    fileId?: string
    extractionMethod?: ExtractionMethod | null
    modelName?: string | null
    fragment?: number | null
  }): Promise<number>

  upsertChunks(parameters: { workspaceId: string; chunks: VectorStoreChunk[] }): Promise<void>

  removeChunks(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string
    extractionMethod?: ExtractionMethod | null
  }): Promise<void>

  getChunks(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string
    extractionMethod?: ExtractionMethod | null
    take: number
    skip: number
  }): Promise<(VectorStoreChunk & { embeddingModelNames: string[] })[]>

  readChunks(params: {
    workspaceId: string
    libraryId: string
    fileId: string
    extractionMethod?: ExtractionMethod | null
  }): AsyncIterable<(VectorStoreChunk & { embeddingModelNames: string[] })[]>

  upsertEmbeddings(parameters: {
    workspaceId: string
    libraryId: string
    fileId: string
    extractionMethod: ExtractionMethod
    fileFragment?: number | null
    embeddingModelName: string
    embeddings: Array<{ chunk: number; vector: number[] }>
  }): Promise<void>

  removeEmbeddings(parameters: {
    workspaceId: string
    libraryId: string
    fileId?: string | null
    extractionMethod?: ExtractionMethod | null
    embeddingModelName?: string | null
  }): Promise<void>

  findSimilarChunks(parameters: {
    workspaceId: string
    libraryId?: string
    fileId?: string
    extractionMethod?: ExtractionMethod | null
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

  getEmbeddingStatus(parameters: { workspaceId: string; embeddingModelName?: string }): Promise<EmbeddingStatus>

  getEmbeddingInfo(parameters: { workspaceId: string; libraryId?: string; fileId?: string }): Promise<EmbeddingInfo[]>
}
