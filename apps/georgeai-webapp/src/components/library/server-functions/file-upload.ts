import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import z from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../../constants'
import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const prepareDesktopFileUploadsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      libraryId: string
      documentId?: string
      files: { name: string; originUri: string; mimeType: string; size: number; modificationDate?: Date }[]
    }) =>
      z
        .object({
          libraryId: z.string().nonempty(),
          documentId: z.string().optional(),
          files: z.array(
            z.object({
              name: z.string().nonempty(),
              originUri: z.string().nonempty(),
              mimeType: z.string().nonempty(),
              size: z.number().nonnegative().optional(),
              modificationDate: z.date().optional(),
            }),
          ),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getCookie('keycloak-token')
    if (!token) {
      throw new Error('User token not found in cookies')
    }
    const processFiles = data.files.map(async (file) => {
      const response = await backendRequest(
        graphql(`
          mutation prepareDesktopFile($libraryId: String!, $documentId: String, $input: PrepareUploadInput!) {
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
            name: file.name,
            originUri: file.originUri,
            mimeType: file.mimeType,
            size: file.size,
            modificationDate: file.modificationDate,
          },
        },
      )

      const preparedFile = response.prepareUpload

      return {
        fileName: file.name,
        uploadUrl: `${BACKEND_PUBLIC_URL}/upload`,
        method: 'POST',
        headers: [
          { name: 'Authorization', value: `ApiKey ${GRAPHQL_API_KEY}` },
          { name: 'x-workspace-id', value: preparedFile.workspaceId },
          { name: 'x-upload-token', value: `["${preparedFile.libraryId}","${preparedFile.documentId}"]` },
          { name: 'x-user-jwt', value: token },
        ],
        fileId: preparedFile.documentId,
      }
    })

    return await Promise.all(processFiles)
  })

export const cancelFileUploadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; fileId: string }) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await backendRequest(
      graphql(`
        mutation cancelFileUpload($libraryId: String!, $fileId: String!) {
          cancelUpload(libraryId: $libraryId, fileId: $fileId)
        }
      `),
      { libraryId: data.libraryId, fileId: data.fileId },
    )
  })
