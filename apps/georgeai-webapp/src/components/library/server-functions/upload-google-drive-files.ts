import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getMimeTypeFromFileName } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { backendRequest, backendUpload } from '../../../server-functions/backend'

export interface GoogleDriveFileInput {
  id: string
  name: string
  size: number
  mimeType: string
  iconLink?: string
  modifiedTime?: string
}

export const uploadGoogleDriveFiles = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; files: Array<GoogleDriveFileInput>; access_token: string }) =>
    z
      .object({
        libraryId: z.string().min(1),
        files: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            size: z.number(),
            mimeType: z.string(),
            iconLink: z.string().optional(),
            modifiedTime: z.string().optional(),
          }),
        ),
        access_token: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const processFiles = ctx.data.files.map(async (file) => {
      let isPdfExport = true
      const googleDownloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application%2Fpdf`,
        {
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        },
      ).then(async (response) => {
        if (response.ok) {
          return response
        }

        isPdfExport = false
        return await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&source=downloadUrl`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        })
      })

      if (!googleDownloadResponse.ok) {
        console.error('Failed to download file from Google Drive', file)
        const body = await googleDownloadResponse.text()
        console.error('Response', body)
        throw new Error(`Failed to download file from Google Drive: ${file.id}`)
      }

      const blob = await googleDownloadResponse.blob()

      const response = await backendRequest(
        graphql(`
          mutation prepareFile($file: AiLibraryFileInput!) {
            prepareFileUpload(data: $file) {
              id
            }
          }
        `),
        {
          file: {
            // Add .pdf extension if exported as PDF and name doesn't already have it
            name: isPdfExport && !file.name.toLowerCase().endsWith('.pdf') ? `${file.name}.pdf` : file.name,
            originUri: `https://drive.google.com/file/d/${file.id}/view`,
            mimeType: isPdfExport ? 'application/pdf' : getMimeTypeFromFileName(file.name),
            libraryId: ctx.data.libraryId,
            size: file.size || blob.size,
            // Use the file's modification date from Google Drive, fallback to now
            originModificationDate: file.modifiedTime || new Date().toISOString(),
          },
        },
      )

      const uploadResponse = await backendUpload(blob, response.prepareFileUpload.id)

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${file.name} (ID: ${file.id})`)
      }

      return await backendRequest(
        graphql(`
          mutation processFile($fileId: String!) {
            createContentProcessingTask(fileId: $fileId) {
              id
            }
          }
        `),
        {
          fileId: response.prepareFileUpload.id,
        },
      )
    })

    const results = await Promise.allSettled(processFiles)
    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason)
    if (errors.length > 0) {
      throw new Error(`Failed to process some files:\n${errors.join('\n')}`)
    }
  })
