import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getFile = createServerFn({ method: 'GET' })
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
            name
            originUri
            docPath
            mimeType
            size
            createdAt
            updatedAt
            archivedAt
            originModificationDate
            lastUpdate {
              id
              createdAt
              message
              updateType
            }
            manifest {
              version
              sourceHash
              extractions {
                extractionMethod
                extractionHash
                extractionDate
              }
            }
          }
        }
      `),
      data,
    )
    return result.file
  })

export const getFileQueryOptions = (parameters: { fileId: string; libraryId: string }) => ({
  queryKey: [queryKeys.File, parameters],
  queryFn: () => getFile({ data: parameters }),
})
