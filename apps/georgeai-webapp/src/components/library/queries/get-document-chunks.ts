import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetDocumentChunksParameterSchema = z.object({
  libraryId: z.string().nonempty(),
  documentId: z.string().nonempty(),
  firstChunk: z.number().int().min(0).optional(),
  take: z.number().int().min(1).optional(),
  fragment: z.number().int().optional(),
})

const getDocumentChunksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetDocumentChunksParameterSchema>) =>
    GetDocumentChunksParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileChunks(
          $libraryId: String!
          $documentId: String!
          $firstChunk: Int
          $take: Int
          $extractionMethod: ExtractionMethod
          $fragment: Int
        ) {
          documentChunks(
            libraryId: $libraryId
            documentId: $documentId
            firstChunk: $firstChunk
            take: $take
            extractionMethod: $extractionMethod
            fragment: $fragment
          ) {
            totalCount
            chunks {
              id
              libraryId
              documentId
              chunk
              content
              documentName
              extractionMethod
              fragment
            }
          }
        }
      `),
      data,
    )
    return result.documentChunks || { totalCount: undefined }
  })

export const getDocumentChunksQueryOptions = (parameters: z.infer<typeof GetDocumentChunksParameterSchema>) => ({
  queryKey: [queryKeys.DocumentChunks, parameters],
  queryFn: () =>
    getDocumentChunksFn({
      data: parameters,
    }),
})
