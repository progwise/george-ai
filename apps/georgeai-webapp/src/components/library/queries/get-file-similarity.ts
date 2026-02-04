import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getSimilarFileChunksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
        term: z.string().optional(),
        hits: z.number().int().min(1).default(20),
        part: z.number().int().optional(),
        useQuery: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getSimilarFileChunks(
          $libraryId: String!
          $fileId: String!
          $term: String
          $hits: Int!
          $part: Int
          $useQuery: Boolean
        ) {
          aiSimilarFileChunks(
            libraryId: $libraryId
            fileId: $fileId
            term: $term
            hits: $hits
            part: $part
            useQuery: $useQuery
          ) {
            id
            fileName
            fileId
            originUri
            text
            section
            headingPath
            chunkIndex
            subChunkIndex
            distance
            points
            part
          }
        }
      `),
      { fileId: data.fileId, term: data.term, hits: data.hits, part: data.part, useQuery: data.useQuery },
    )
    return result
  })

export const getSimilarFileChunksQueryOptions = (params: {
  fileId: string
  term?: string
  hits?: number
  part?: number
  useQuery?: boolean
}) => ({
  queryKey: [queryKeys.SimilarFileChunks, { ...params }],
  queryFn: () =>
    getSimilarFileChunksFn({
      data: {
        fileId: params.fileId,
        term: params.term,
        hits: params.hits,
        part: params.part,
        useQuery: params.useQuery,
      },
    }),
})
