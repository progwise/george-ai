import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import z from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../../constants'
import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const prepareDesktopFileUploadsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { libraryId: string; files: { name: string; type: string; size: number; lastModified: Date }[] }) =>
      z
        .object({
          libraryId: z.string().nonempty(),
          files: z.array(
            z.object({
              name: z.string().nonempty(),
              type: z.string().nonempty(),
              size: z.number().nonnegative(),
              lastModified: z.date(),
            }),
          ),
        })
        .parse(data),
  )
  .handler(async (ctx) => {
    const token = getCookie('keycloak-token')
    if (!token) {
      throw new Error('User token not found in cookies')
    }
    const processFiles = ctx.data.files.map(async (file) => {
      const response = await backendRequest(
        graphql(`
          mutation prepareDesktopFile($file: AiLibraryFileInput!) {
            prepareFileUpload(data: $file) {
              id
            }
          }
        `),
        {
          file: {
            name: file.name,
            originUri: 'desktop',
            mimeType: file.type || 'application/pdf',
            libraryId: ctx.data.libraryId,
            size: file.size,
            originModificationDate: file.lastModified.toISOString(),
          },
        },
      )

      const preparedFile = response.prepareFileUpload

      return {
        fileName: file.name,
        uploadUrl: `${BACKEND_PUBLIC_URL}/upload`,
        method: 'POST',
        headers: [
          { name: 'Authorization', value: `ApiKey ${GRAPHQL_API_KEY}` },
          { name: 'x-upload-token', value: preparedFile.id },
          { name: 'x-user-jwt', value: token },
        ],
        fileId: preparedFile.id,
      }
    })

    return await Promise.all(processFiles)
  })

export const cancelFileUploadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { fileId: string }) =>
    z
      .object({
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await backendRequest(
      graphql(`
        mutation cancelFileUpload($fileId: String!) {
          cancelFileUpload(fileId: $fileId)
        }
      `),
      { fileId: data.fileId },
    )
  })
