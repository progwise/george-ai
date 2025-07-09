import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileChunks = createServerFn({ method: 'GET' })
  .validator((data: { fileId: string; libraryId: string }) =>
    z
      .object({
        fileId: z.string().nonempty(),
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileChunks($fileId: String!, $libraryId: String!) {
          readFileChunks(fileId: $fileId, libraryId: $libraryId) {
            id
            text
            section
            headingPath
            chunkIndex
            subChunkIndex
          }
        }
      `),
      { fileId: data.fileId, libraryId: data.libraryId },
    )
    return result
  })

export const getFileChunksQueryOptions = (params: { fileId: string; libraryId: string }) => ({
  queryKey: ['fileChunks', params.fileId, params],
  queryFn: () => getFileChunks({ data: { fileId: params.fileId, libraryId: params.libraryId } }),
})
