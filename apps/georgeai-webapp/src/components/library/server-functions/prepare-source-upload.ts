import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import z from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../../constants'
import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const PrepareSourceUploadDataSchema = z.object({
  libraryId: z.string().nonempty(),
  documentId: z.string().nonempty(),
  name: z.string().nonempty(),
  originUri: z.string().nonempty(),
  mimeType: z.string().nonempty(),
  size: z.number().nonnegative().optional(),
  modificationDate: z.date().pipe(z.coerce.date()).optional(),
})

export const prepareSourceUpload = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof PrepareSourceUploadDataSchema>) => PrepareSourceUploadDataSchema.parse(data))
  .handler(async ({ data }) => {
    const token = getCookie('keycloak-token')
    if (!token) {
      throw new Error('User token not found in cookies')
    }
    const response = await backendRequest(
      graphql(`
        mutation prepareDocumentUpload($libraryId: String!, $documentId: String, $input: PrepareUploadInput!) {
          prepareUpload(libraryId: $libraryId, documentId: $documentId, input: $input) {
            workspaceId
            libraryId
            documentId
            uploadId
          }
        }
      `),
      {
        libraryId: data.libraryId,
        documentId: data.documentId,
        input: {
          name: data.name,
          originUri: data.originUri,
          mimeType: data.mimeType,
          size: data.size,
          modificationDate: data.modificationDate,
        },
      },
    )

    const preparedFile = response.prepareUpload

    const headers: Array<{ name: string; value: string }> = [
      { name: 'Authorization', value: `ApiKey ${GRAPHQL_API_KEY}` },
      { name: 'x-workspace-id', value: preparedFile.workspaceId },
      { name: 'x-upload-token', value: `["${preparedFile.libraryId}","${preparedFile.documentId}"]` },
      { name: 'x-user-jwt', value: token },
    ]

    return {
      fileName: data.name,
      uploadUrl: `${BACKEND_PUBLIC_URL}/upload`,
      method: 'POST',
      headers,
      fileId: preparedFile.documentId,
    }
  })
