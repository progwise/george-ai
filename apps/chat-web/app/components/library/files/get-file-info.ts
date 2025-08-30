import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileInfo = createServerFn({ method: 'GET' })
  .validator((data: unknown) =>
    z
      .object({
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFileInfo($fileId: String!) {
          aiLibraryFile(fileId: $fileId) {
            ...AiLibraryFileInfo_CaptionCard
            ...AiLibraryFile_FileContent
            id
            name
            originUri
            docPath
            mimeType
            size
            createdAt
            updatedAt
            archivedAt
            originModificationDate
            processingStatus
            extractionStatus
            embeddingStatus
            lastUpdate {
              id
              createdAt
              message
              updateType
            }
          }
        }
      `),
      { fileId: data.fileId },
    )
    return result
  })

export const getFileInfoQueryOptions = (params: { fileId: string }) => ({
  queryKey: ['FileInfo', params.fileId, params],
  queryFn: () => getFileInfo({ data: { fileId: params.fileId } }),
})
