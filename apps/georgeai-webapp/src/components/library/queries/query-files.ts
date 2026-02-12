import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { FileChunksSelector } from '../../../gql/graphql'
import { FileChunksSelectorSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const queryFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        selector: FileChunksSelectorSchema(),
        query: z.string().default('*'),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
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
      data,
    )
    return result.queryFileChunks
  })

export const queryFilesQueryOptions = (params: {
  selector: FileChunksSelector
  query: string
  skip: number
  take: number
}) => ({
  queryKey: ['queryFiles', { params }],
  queryFn: async () => {
    return await queryFiles({
      data: params,
    })
  },
})
