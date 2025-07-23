import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileChunks = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        fileId: z.string().nonempty(),
        libraryId: z.string().nonempty(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileChunks($fileId: String!, $libraryId: String!, $skip: Int!, $take: Int!) {
          aiFileChunks(fileId: $fileId, libraryId: $libraryId, skip: $skip, take: $take) {
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
            }
          }
        }
      `),
      { fileId: data.fileId, libraryId: data.libraryId, skip: data.skip, take: data.take },
    )
    return result
  })

export const getFileChunksQueryOptions = (params: {
  fileId: string
  libraryId: string
  skip?: number
  take?: number
}) => ({
  queryKey: ['fileChunks', { ...params }],
  queryFn: () =>
    getFileChunks({
      data: { fileId: params.fileId, libraryId: params.libraryId, skip: params.skip || 0, take: params.take || 20 },
    }),
})
