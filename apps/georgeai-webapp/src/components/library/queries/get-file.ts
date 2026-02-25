import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getFileFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getFile($fileId: String!, $libraryId: String!) {
          file(fileId: $fileId, libraryId: $libraryId) {
            ...FileCaptionCard_File
            id
            createdAt
            updatedAt
            name
            originUri
            docPath
            mimeType
            size
            libraryId
            dropError
            originModificationDate
            archivedAt
            manifest {
              version
              sourceHash
              extractions {
                extractionMethod
                sourceHash
                created
                updated
              }
            }
            supportedExtractionMethods
            chunkCount
            status
            lastUpdate {
              id
              createdAt
              message
              updateType
            }
          }
        }
      `),
      data,
    )
    return result.file
  })

export const getFileQueryOptions = (parameters: { fileId: string; libraryId: string }) => {
  if (parameters.fileId === 'attachments') {
    throw new Error('Attachments are not supported for getFile query')
  }
  return queryOptions({
    queryKey: [queryKeys.File, parameters],
    queryFn: () => getFileFn({ data: parameters }),
  })
}
