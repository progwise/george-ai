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
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getSimilarFileChunks($fileId: String!, $term: String, $hits: Int!) {
          aiSimilarFileChunks(fileId: $fileId, term: $term, hits: $hits) {
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
          }
        }
      `),
      { fileId: data.fileId, term: data.term, hits: data.hits },
    )
    return result
  })

export const getSimilarFileChunksOptions = (params: { fileId: string; term?: string; hits?: number }) => ({
  queryKey: ['fileChunks', { ...params }],
  queryFn: () =>
    getSimilarFileChunks({
      data: { fileId: params.fileId, term: params.term, maxHits: params.hits },
    }),
})
