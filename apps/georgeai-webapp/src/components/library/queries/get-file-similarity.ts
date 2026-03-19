import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetSimilarFileChunksInputSchema = z.object({
  libraryId: z.string().nonempty(),
  documentId: z.string().nonempty(),
  term: z.string().optional(),
  hits: z.number().int().min(1).default(20),
  fragment: z.number().int().optional(),
})
// TODO: Query currently not implemented, only similarity
const getSimilarFileChunksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetSimilarFileChunksInputSchema>) =>
    GetSimilarFileChunksInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getSimilarChunks($libraryId: String!, $documentId: String!, $term: String, $hits: Int!, $fragment: Int) {
          similarChunks(
            libraryId: $libraryId
            documentId: $documentId
            term: $term
            maxResults: $hits
            fragment: $fragment
          ) {
            id
            distance
            chunk
            documentName
            documentId
            extractionMethod
            content
            fragment
          }
        }
      `),
      data,
    )
    return result.similarChunks
  })

export const getSimilarFileChunksQueryOptions = (parameters: z.infer<typeof GetSimilarFileChunksInputSchema>) => ({
  queryKey: [queryKeys.SimilarFileChunks, parameters],
  queryFn: () =>
    getSimilarFileChunksFn({
      data: parameters,
    }),
})
