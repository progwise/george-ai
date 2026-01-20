/*
 * Vector Store Client - Provider-agnostic vector store with operations
 */
import { VectorStoreDocument, VectorStoreDocumentIdentifier } from '../schema'

// Record with model name as key and vector as value
export type VectorModelMap = Record<string, number[]>

export interface VectorStoreFilesSelector {
  libraryId?: string
  fileId?: string
  shardIndex?: number | null
  chunkIndex?: number
  contentGlobPattern?: string
  filenameGlobPattern?: string
  filePathGlobPattern?: string
  fileHash?: string
  fileMimeTypeGlobPattern?: string
  fileCreatedAt?: { earliest: string; latest?: string } // ISO date string
  fileUpdatedAt?: { earliest: string; latest?: string } // ISO date string
  fileUploadedAt?: { earliest: string; latest?: string } // ISO date string
  creationAuthorGlobPattern?: string
  updateAuthorGlobPattern?: string
}

export interface VectorStoreClient {
  ensureWorkspace(workspaceId: string): Promise<void>

  removeWorkspace(workspaceId: string): Promise<void>

  upsertDocuments(workspaceId: string, documents: (VectorStoreDocument & { vectors: VectorModelMap })[]): Promise<void>

  removeDocuments(workspaceId: string, selector: VectorStoreFilesSelector): Promise<void>

  addVectors(
    workspaceId: string,
    documents: (VectorStoreDocumentIdentifier & { vectors: VectorModelMap })[],
  ): Promise<void>

  removeVectors(workspaceId: string, selector: VectorStoreFilesSelector, modelNames: string[]): Promise<void>

  chunkCount(workspaceId: string, selector: VectorStoreFilesSelector): Promise<number>

  getDocuments(
    workspaceId: string,
    selector: VectorStoreFilesSelector,
    skip: number,
    take: number,
  ): Promise<{ hitCount: number; results: Array<{ identifier: VectorStoreDocument }> }>

  findSimilarDocuments(
    workspaceId: string,
    selector: VectorStoreFilesSelector,
    modelName: string,
    vector: number[],
    topK: number,
  ): Promise<{ results: Array<{ identifier: VectorStoreDocument; distance: number }> }>
}
