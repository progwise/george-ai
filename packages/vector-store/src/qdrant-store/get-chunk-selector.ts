import { Schemas } from '@qdrant/js-client-rest'

import { VectorStoreChunksSelector } from '../schema'

export const getChunkSelector = (selector: VectorStoreChunksSelector): Schemas['Filter'] => {
  if (selector.documentId && !selector.libraryId) {
    throw new Error('libraryId is required when fileId is provided')
  }
  if (selector.extractionMethod && !selector.documentId) {
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

  if (selector.libraryId) {
    filter.must.push({
      key: 'libraryId',
      match: { value: selector.libraryId },
    })
  }

  if (selector.documentId) {
    filter.must.push({
      key: 'documentId',
      match: { value: selector.documentId },
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

  if (selector.documentNameGlobPattern) {
    filter.must.push({
      key: 'documentName',
      match: { wildcard: selector.documentNameGlobPattern },
    })
  }

  if (selector.documentPathGlobPattern) {
    filter.must.push({
      key: 'documentPath',
      match: { wildcard: selector.documentPathGlobPattern },
    })
  }

  if (selector.documentHash) {
    filter.must.push({
      key: 'documentHash',
      match: { value: selector.documentHash },
    })
  }

  if (selector.documentMimeTypeGlobPattern) {
    filter.must.push({
      key: 'documentMimeType',
      match: { wildcard: selector.documentMimeTypeGlobPattern },
    })
  }

  if (selector.documentCreatedAt) {
    filter.must.push({
      key: 'documentCreatedAt',
      match: {
        range: {
          ...(selector.documentCreatedAt.earliest ? { gte: selector.documentCreatedAt.earliest.toISOString() } : {}),
          ...(selector.documentCreatedAt.latest ? { lte: selector.documentCreatedAt.latest.toISOString() } : {}),
        },
      },
    })
  }

  if (selector.documentUpdatedAt) {
    filter.must.push({
      key: 'documentUpdatedAt',
      match: {
        range: {
          ...(selector.documentUpdatedAt.earliest ? { gte: selector.documentUpdatedAt.earliest.toISOString() } : {}),
          ...(selector.documentUpdatedAt.latest ? { lte: selector.documentUpdatedAt.latest.toISOString() } : {}),
        },
      },
    })
  }

  if (selector.documentUploadedAt) {
    filter.must.push({
      key: 'documentUploadedAt',
      match: {
        range: {
          ...(selector.documentUploadedAt.earliest ? { gte: selector.documentUploadedAt.earliest.toISOString() } : {}),
          ...(selector.documentUploadedAt.latest ? { lte: selector.documentUploadedAt.latest.toISOString() } : {}),
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
