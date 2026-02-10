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
        part: z.number().int().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getSimilarChunks(
          $libraryId: String!
          $fileId: String!
          $term: String
          $maxResults: Int!
          $fragment: Int
          $modelProvider: ModelProvider!
          $modelName: String!
        ) {
          similarChunks(
            libraryId: $libraryId
            fileId: $fileId
            term: $term
            maxResults: $maxResults
            fragment: $fragment
            modelProvider: $modelProvider
            modelName: $modelName
          ) {
            id
            distance
            chunk
            filename
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

export const getSimilarFileChunksQueryOptions = (params: {
  fileId: string
  term?: string
  hits?: number
  part?: number
}) => ({
  queryKey: [queryKeys.SimilarFileChunks, { ...params }],
  queryFn: () =>
    getSimilarFileChunksFn({
      data: {
        fileId: params.fileId,
        term: params.term,
        hits: params.hits,
        part: params.part,
      },
    }),
})
