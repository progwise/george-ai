import { QdrantClient, Schemas } from '@qdrant/js-client-rest'

import { createLogger } from '@george-ai/web-utils'

import { VectorStoreDocument, VectorStoreDocumentIdentifier } from '../schema'
import { VectorModelMap, VectorStoreClient, VectorStoreFilesSelector } from './vector-store-client'

const logger = createLogger('VectorStoreClient:QdrantClient')

const getCollectionName = (workspaceId: string) => `workspace_${workspaceId}`
const getDocumentId = (document: VectorStoreDocumentIdentifier): string => {
  const shardPart = document.shardIndex !== null ? `_shard${document.shardIndex}` : ''
  return `${document.libraryId}_file${document.fileId}${shardPart}_chunk${document.chunkIndex}`
}
const getFileSelector = (selector: VectorStoreFilesSelector) => {
  const filter: {
    must: Array<{
      key: string
      match: { value?: string | number; wildcard?: string; range?: { gte?: string | number; lte?: string | number } }
    }>
  } = { must: [] }

  if (selector.libraryId) {
    filter.must.push({
      key: 'libraryId',
      match: { value: selector.libraryId },
    })
  }

  if (selector.fileId) {
    filter.must.push({
      key: 'fileId',
      match: { value: selector.fileId },
    })
  }

  if (selector.chunkIndex !== undefined && selector.chunkIndex !== null) {
    filter.must.push({
      key: 'chunkIndex',
      match: { value: selector.chunkIndex },
    })
  }

  if (selector.shardIndex !== undefined && selector.shardIndex !== null) {
    filter.must.push({
      key: 'shardIndex',
      match: { value: selector.shardIndex },
    })
  }

  if (selector.contentGlobPattern) {
    filter.must.push({
      key: 'content',
      match: { wildcard: selector.contentGlobPattern },
    })
  }

  if (selector.filenameGlobPattern) {
    filter.must.push({
      key: 'filename',
      match: { wildcard: selector.filenameGlobPattern },
    })
  }

  if (selector.filePathGlobPattern) {
    filter.must.push({
      key: 'filePath',
      match: { wildcard: selector.filePathGlobPattern },
    })
  }

  if (selector.fileHash) {
    filter.must.push({
      key: 'fileHash',
      match: { value: selector.fileHash },
    })
  }

  if (selector.fileMimeTypeGlobPattern) {
    filter.must.push({
      key: 'fileMimeType',
      match: { wildcard: selector.fileMimeTypeGlobPattern },
    })
  }

  if (selector.fileCreatedAt) {
    filter.must.push({
      key: 'fileCreatedAt',
      match: {
        range: {
          ...(selector.fileCreatedAt.earliest ? { gte: selector.fileCreatedAt.earliest } : {}),
          ...(selector.fileCreatedAt.latest ? { lte: selector.fileCreatedAt.latest } : {}),
        },
      },
    })
  }

  if (selector.fileUpdatedAt) {
    filter.must.push({
      key: 'fileUpdatedAt',
      match: {
        range: {
          ...(selector.fileUpdatedAt.earliest ? { gte: selector.fileUpdatedAt.earliest } : {}),
          ...(selector.fileUpdatedAt.latest ? { lte: selector.fileUpdatedAt.latest } : {}),
        },
      },
    })
  }

  if (selector.fileUploadedAt) {
    filter.must.push({
      key: 'fileUploadedAt',
      match: {
        range: {
          ...(selector.fileUploadedAt.earliest ? { gte: selector.fileUploadedAt.earliest } : {}),
          ...(selector.fileUploadedAt.latest ? { lte: selector.fileUploadedAt.latest } : {}),
        },
      },
    })
  }

  if (selector.creationAuthorGlobPattern) {
    filter.must.push({
      key: 'creationAuthor',
      match: { wildcard: selector.creationAuthorGlobPattern },
    })
  }

  if (selector.updateAuthorGlobPattern) {
    filter.must.push({
      key: 'updateAuthor',
      match: { wildcard: selector.updateAuthorGlobPattern },
    })
  }

  return filter
}

export class QdrantClientImplementation implements VectorStoreClient {
  private client: QdrantClient

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://gai-qdrant:6333',
      apiKey: process.env.QDRANT_API_KEY || undefined,
    })
  }

  private async ensurePayloadIndex(
    collectionName: string,
    collectionInfo: Schemas['CollectionInfo'],
    fieldName: string,
    schemaType: 'keyword' | 'integer' | 'text' | 'datetime',
  ) {
    const existingIndexes = collectionInfo.payload_schema || {}

    if (existingIndexes[fieldName]) {
      logger.info(`Index for field already exists. Skipping.`, { collectionName, fieldName })
      return
    }

    // 3. Create the index if it's missing
    logger.info(`Creating index for field.`, { collectionName, fieldName, schemaType })
    await this.client.createPayloadIndex(collectionName, {
      field_name: fieldName,
      field_schema: schemaType, // e.g., 'keyword', 'integer', 'text', 'datetime'
      wait: true,
    })
  }

  async ensureWorkspace(workspaceId: string): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    const { exists } = await this.client.collectionExists(collectionName)
    if (!exists) {
      logger.info(`Creating Qdrant collection for workspace`, { workspaceId, collectionName })
      await this.client.createCollection(collectionName, {})
    }
    const collectionInfo = await this.client.getCollection(collectionName)
    await Promise.all([
      this.ensurePayloadIndex(collectionName, collectionInfo, 'libraryId', 'keyword'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileId', 'keyword'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'chunkIndex', 'integer'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'shardIndex', 'integer'),

      this.ensurePayloadIndex(collectionName, collectionInfo, 'filename', 'text'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'filePath', 'text'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'content', 'text'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileHash', 'keyword'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileSizeBytes', 'integer'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileMimeType', 'text'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileCreatedAt', 'datetime'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileUpdatedAt', 'datetime'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'fileUploadedAt', 'datetime'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'creationAuthor', 'text'),
      this.ensurePayloadIndex(collectionName, collectionInfo, 'updateAuthor', 'text'),
    ])
  }

  async removeWorkspace(workspaceId: string): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    await this.client.deleteCollection(collectionName)
  }
  async upsertDocuments(
    workspaceId: string,
    documents: (VectorStoreDocument & { vectors: Record<string, number[]> })[],
  ): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    const points = documents.map((doc) => ({
      id: getDocumentId(doc),
      vector: doc.vectors,
      payload: {
        content: doc.content,
        libraryId: doc.libraryId,
        fileId: doc.fileId,
        shardIndex: doc.shardIndex,
        chunkIndex: doc.chunkIndex,
      },
    }))
    await this.client.upsert(collectionName, { wait: true, points })
  }
  async removeDocuments(workspaceId: string, selector: VectorStoreFilesSelector): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    const filter = getFileSelector(selector)
    await this.client.delete(collectionName, {
      wait: true,
      filter,
    })
  }

  async addVectors(
    workspaceId: string,
    documents: (VectorStoreDocumentIdentifier & { vectors: VectorModelMap })[],
  ): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    await this.client.upsert(collectionName, {
      wait: true,
      points: documents.map((doc) => ({
        id: getDocumentId(doc),
        vector: doc.vectors,
      })),
    })
  }

  async removeVectors(workspaceId: string, selector: VectorStoreFilesSelector, modelNames: string[]): Promise<void> {
    const collectionName = getCollectionName(workspaceId)
    const filter = getFileSelector(selector)

    await this.client.deleteVectors(collectionName, {
      filter,
      vector: modelNames,
    })
  }

  async chunkCount(workspaceId: string, selector: VectorStoreFilesSelector): Promise<number> {
    const collectionName = getCollectionName(workspaceId)
    const filter = getFileSelector(selector)

    const count = await this.client.count(collectionName, { filter })
    return count.count
  }

  async getDocuments(
    workspaceId: string,
    selector: VectorStoreFilesSelector,
    skip: number,
    take: number,
  ): Promise<{ hitCount: number; results: Array<{ identifier: VectorStoreDocument }> }> {
    const collectionName = getCollectionName(workspaceId)
    const filter = getFileSelector(selector)

    const [data, count] = await Promise.all([
      this.client.scroll(collectionName, {
        filter,
        limit: take,
        offset: skip,
        with_payload: true,
        with_vector: false,
      }),
      this.client.count(collectionName, { filter }),
    ])

    return {
      hitCount: count.count,
      results: data.points.map((point) => ({
        identifier: {
          libraryId: point.payload?.libraryId as string,
          fileId: point.payload?.fileId as string,
          shardIndex: point.payload?.shardIndex as number | null,
          chunkIndex: point.payload?.chunkIndex as number,
          content: point.payload?.content as string,
          filename: point.payload?.filename as string,
          fileHash: point.payload?.fileHash as string,
          fileSizeBytes: point.payload?.fileSizeBytes as number,
          fileMimeType: point.payload?.fileMimeType as string,
          fileCreatedAt: point.payload?.fileCreatedAt as string,
          fileUpdatedAt: point.payload?.fileUpdatedAt as string,
          fileUploadedAt: point.payload?.fileUploadedAt as string,
          creationAuthor: point.payload?.creationAuthor as string,
          updateAuthor: point.payload?.updateAuthor as string,
        },
      })),
    }
  }

  async findSimilarDocuments(
    workspaceId: string,
    selector: VectorStoreFilesSelector,
    modelName: string,
    vector: number[],
    topK: number,
    maxDistance?: number,
  ): Promise<{ results: Array<{ identifier: VectorStoreDocument; distance: number }> }> {
    const collectionName = getCollectionName(workspaceId)
    const filter = getFileSelector(selector)

    const response = await this.client.search(collectionName, {
      filter,
      vector: {
        name: modelName,
        vector,
      },
      limit: topK,
      with_payload: true,
      with_vector: false,
      ...(maxDistance !== undefined ? { score_threshold: maxDistance } : {}),
    })

    return {
      results: response.map((point) => ({
        identifier: {
          libraryId: point.payload?.libraryId as string,
          fileId: point.payload?.fileId as string,
          shardIndex: point.payload?.shardIndex as number | null,
          chunkIndex: point.payload?.chunkIndex as number,
          content: point.payload?.content as string,
          filename: point.payload?.filename as string,
          fileHash: point.payload?.fileHash as string,
          fileSizeBytes: point.payload?.fileSizeBytes as number,
          fileMimeType: point.payload?.fileMimeType as string,
          fileCreatedAt: point.payload?.fileCreatedAt as string,
          fileUpdatedAt: point.payload?.fileUpdatedAt as string,
          fileUploadedAt: point.payload?.fileUploadedAt as string,
          creationAuthor: point.payload?.creationAuthor as string,
          updateAuthor: point.payload?.updateAuthor as string,
        },
        distance: point.score,
      })),
    }
  }
}
