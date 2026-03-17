import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetDocumentParameterSchema = z.object({
  libraryId: z.string().nonempty(),
  fileId: z.string().nonempty(),
})
const getDocumentFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetDocumentParameterSchema>) => GetDocumentParameterSchema.parse(data))
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

export const getDocumentQueryOptions = (parameters: { fileId: string; libraryId: string }) => {
  return queryOptions({
    queryKey: [queryKeys.Document, parameters],
    queryFn: () => getDocumentFn({ data: parameters }),
  })
}
