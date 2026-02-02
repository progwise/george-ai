import { Schemas } from '@qdrant/js-client-rest'

import { VectorStoreChunksSelector } from '../schema'

export const getChunkSelector = (selector: VectorStoreChunksSelector): Schemas['Filter'] => {
  if (selector.fileId && !selector.libraryId) {
    throw new Error('libraryId is required when fileId is provided')
  }
  if (selector.extractionMethod && !selector.fileId) {
    throw new Error('fileId is required when extractionMethod is provided')
  }
  if (!selector.extractionMethod && selector.fragment) {
    throw new Error('extractionMethod is required when fragment is provided')
  }
  if (selector.chunk && !selector.extractionMethod) {
    throw new Error('extractionMethod is required when chunk is provided')
  }

  const filter: {
    must: Array<
      | { has_vector: string }
      | {
          key: string
          match: {
            value?: string | number
            wildcard?: string
            range?: { gte?: string | number; lte?: string | number }
          }
        }
    >
  } = { must: [] }

  if (selector.modelName) {
    filter.must.push({
      has_vector: selector.modelName,
    })
  }

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

  if (selector.extractionMethod) {
    filter.must.push({
      key: 'extractionMethod',
      match: { value: selector.extractionMethod },
    })
  }

  if (selector.chunk !== undefined && selector.chunk !== null) {
    filter.must.push({
      key: 'chunkIndex',
      match: { value: selector.chunk },
    })
  }

  if (selector.fragment !== undefined && selector.fragment !== null) {
    filter.must.push({
      key: 'shardIndex',
      match: { value: selector.fragment },
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
