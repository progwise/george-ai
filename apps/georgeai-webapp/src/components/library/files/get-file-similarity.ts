import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getSimilarFileChunks = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
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
        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!, $part: Int, $useQuery: Boolean) {
          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits, part: $part, useQuery: $useQuery) {
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

export const getSimilarFileChunksOptions = (params: {
  fileId: string
  term?: string
  hits?: number
  part?: number
  useQuery?: boolean
}) => ({
  queryKey: ['fileChunks', { ...params }],
  queryFn: () =>
    getSimilarFileChunks({
      data: {
        fileId: params.fileId,
        term: params.term,
        hits: params.hits,
        part: params.part,
        useQuery: params.useQuery,
      },
    }),
})
