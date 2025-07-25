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
          mutation dropFile($id: String!) {
            dropFile(fileId: $id) {
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

export const reprocessFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reprocessFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation reprocessFile($id: String!) {
            processFile(fileId: $id) {
              id
              name
              chunks
              size
              uploadedAt
              processedAt
              processingErrorMessage
            }
          }
        `),
        { id: fileId },
      ).catch((error) => {
        console.log(`Error re-processing file ${fileId}:`, error)
      }),
    )
    const result = await Promise.all(reprocessFilePromises).catch((error) => {
      console.error('Error re-processing files:', error)
      throw new Error('Failed to re-process files')
    })

    return result.filter((file) => file !== undefined)
  })

export const dropAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const clearEmbeddedFilesPromise = ctx.data.map((libraryId) =>
      backendRequest(
        graphql(`
          mutation clearEmbeddedFiles($libraryId: String!) {
            clearEmbeddedFiles(libraryId: $libraryId)
          }
        `),
        { libraryId: libraryId },
      ),
    )
    return await Promise.all(clearEmbeddedFilesPromise)
  })

export const processUnprocessedFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const results = await Promise.all(
      ctx.data.map(async (libraryId) => {
        try {
          const processing = await backendRequest(
            graphql(`
              mutation processUnprocessedFiles($libraryId: String!) {
                processUnprocessedFiles(libraryId: $libraryId)
              }
            `),
            { libraryId },
          )

          const [totalProcessedCount = 0, successfulCount = 0] = processing?.processUnprocessedFiles ?? []
          return { libraryId, totalProcessedCount, successfulCount, success: true }
        } catch (error) {
          console.error(`Failed to process files in library ${libraryId}:`, error)
          return { libraryId, success: false }
        }
      }),
    )
    return results
  })
