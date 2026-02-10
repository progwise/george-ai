import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const queryFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        query: z.string().default('*'),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query queryLibraryFiles($selector: FileChunksSelector!, $query: String!, $skip: Int!, $take: Int!) {
          queryFileChunks(selector: $selector, query: $query, skip: $skip, take: $take) {
            hitCount
            results {
              id
              libraryId
              fileId
              filename
              extractionMethod
              chunk
              content
              ...LibraryQueryResult_FileChunk
            }
          }
        }
      `),
      { ...ctx.data },
    )
    return result.queryFileChunks
  })

export const queryFilesQueryOptions = (params: { libraryId: string; query: string; skip: number; take: number }) => ({
  queryKey: ['queryFiles', params.libraryId, params.query, params.skip, params.take],
  queryFn: async () => {
    return await queryFiles({
      data: {
        libraryId: params.libraryId,
        query: params.query,
        skip: params.skip,
        take: params.take,
      },
    })
  },
})
