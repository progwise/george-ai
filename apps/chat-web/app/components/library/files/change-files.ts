import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const dropFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation deleteFile($id: String!) {
            deleteFile(fileId: $id) {
              id
              name
            }
          }
        `),
        { id: fileId },
      ).catch((error) => {
        console.error(`Error dropping file ${fileId}:`, error)
      }),
    )
    const result = await Promise.all(dropFilePromises).catch((error) => {
      console.error('Error dropping files:', error)
      throw new Error('Failed to drop files')
    })
    return result.filter((file) => file !== undefined)
  })

export const reEmbedFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reEmbedFilePromises = ctx.data.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation reEmbedFiles($id: String!) {
            createEmbeddingOnlyTask(fileId: $id) {
              id
            }
          }
        `),
        { id: fileId },
      )
      return result.embedFile
    })

    return await Promise.all(reEmbedFilePromises)
  })

export const reprocessFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reprocessFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation createContentExtractionTask($id: String!) {
            createContentExtractionTask(fileId: $id) {
              id
            }
          }
        `),
        { id: fileId },
      ),
    )

    return await Promise.all(reprocessFilePromises)
  })
