import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileChunks = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        fileId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileChunks($fileId: String!, $skip: Int!, $take: Int!) {
          aiFileChunks(fileId: $fileId, skip: $skip, take: $take) {
            fileId
            fileName
            take
            skip
            count
            chunks {
              id
              text
              section
              headingPath
              chunkIndex
              subChunkIndex
              part
            }
          }
        }
      `),
      { fileId: data.fileId, skip: data.skip, take: data.take },
    )
    return result
  })

export const getFileChunksQueryOptions = (params: { fileId: string; skip?: number; take?: number }) => ({
  queryKey: ['fileChunks', { ...params }],
  queryFn: () =>
    getFileChunks({
      data: { fileId: params.fileId, skip: params.skip || 0, take: params.take || 20 },
    }),
})
