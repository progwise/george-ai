import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

// TODO: Query currently not implemented, only similarity
const getSimilarFileChunksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
        term: z.string().optional(),
        hits: z.number().int().min(1).default(20),
        fragment: z.number().int().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getSimilarChunks($libraryId: String!, $fileId: String!, $term: String, $hits: Int!, $fragment: Int) {
          similarChunks(libraryId: $libraryId, fileId: $fileId, term: $term, maxResults: $hits, fragment: $fragment) {
            id
            distance
            chunk
            fileName
            fileId
            extractionMethod
            content
            embeddingModelNames
            fragment
          }
        }
      `),
      data,
    )
    return result.similarChunks
  })

export const getSimilarFileChunksQueryOptions = (parameters: {
  libraryId: string
  fileId: string
  term?: string
  hits?: number
  fragment?: number
}) => ({
  queryKey: [queryKeys.SimilarFileChunks, parameters],
  queryFn: () =>
    getSimilarFileChunksFn({
      data: parameters,
    }),
})
