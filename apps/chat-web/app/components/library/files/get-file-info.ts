import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileInfo = createServerFn({ method: 'GET' })
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
        query getFileInfo($fileId: String!, $libraryId: String!) {
          aiLibraryFile(fileId: $fileId, libraryId: $libraryId) {
            id
            name
            originUri
            docPath
            mimeType
            size
            createdAt
            updatedAt
            processedAt
            processingErrorMessage
            originModificationDate
            lastUpdate {
              id
              createdAt
              message
              success
            }
          }
        }
      `),
      { fileId: data.fileId, libraryId: data.libraryId },
    )
    return result
  })

export const getFileInfoQueryOptions = (params: { fileId: string; libraryId: string }) => ({
  queryKey: ['fileChunks', params.fileId, params],
  queryFn: () => getFileInfo({ data: { fileId: params.fileId, libraryId: params.libraryId } }),
})
