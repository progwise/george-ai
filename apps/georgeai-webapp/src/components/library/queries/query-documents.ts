import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { DocumentChunksSelector } from '../../../gql/graphql'
import { DocumentChunksSelectorSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const queryDocuments = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        selector: DocumentChunksSelectorSchema(),
        query: z.string().default('*'),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query queryLibraryDocuments($selector: DocumentChunksSelector!, $query: String!, $skip: Int!, $take: Int!) {
          queryDocumentChunks(selector: $selector, query: $query, skip: $skip, take: $take) {
            hitCount
            results {
              id
              libraryId
              documentId
              documentName
              extractionMethod
              chunk
              content
              ...LibraryQueryResult_FileChunk
            }
          }
        }
      `),
      data,
    )
    return result.queryDocumentChunks
  })

export const queryDocumentsQueryOptions = (params: {
  selector: DocumentChunksSelector
  query: string
  skip: number
  take: number
}) => ({
  queryKey: ['queryDocuments', { params }],
  queryFn: async () => {
    return await queryDocuments({
      data: params,
    })
  },
})
