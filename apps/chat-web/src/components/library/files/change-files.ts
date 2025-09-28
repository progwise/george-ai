import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteLibraryFiles = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ libraryId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteLibraryFiles($libraryId: String!) {
          deleteLibraryFiles(libraryId: $libraryId)
        }
      `),
      data,
    )
  })

export const deleteFile = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ fileId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteFile($fileId: String!) {
          deleteFile(fileId: $fileId) {
            id
            name
          }
        }
      `),
      data,
    )
  })

export const deleteFiles = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ fileIds: z.array(z.string().nonempty()) }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteFiles($fileIds: [ID!]!) {
          deleteFiles(fileIds: $fileIds)
        }
      `),
      data,
    )
  })

export const createEmbeddingTasks = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ fileIds: z.array(z.string()).nonempty() }).parse(data))
  .handler(async ({ data }) => {
    const createTaskPromises = data.fileIds.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation createEmbeddingTasks($id: String!) {
            createEmbeddingOnlyProcessingTask(fileId: $id) {
              id
              file {
                name
              }
            }
          }
        `),
        { id: fileId },
      )
      return result.createEmbeddingOnlyProcessingTask
    })

    return await Promise.all(createTaskPromises)
  })

export const createProcessingTasks = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ fileIds: z.array(z.string()).nonempty() }).parse(data))
  .handler(async ({ data }) => {
    const createProcessingTasksPromises = data.fileIds.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation createExtractionTasks($id: String!) {
            createContentProcessingTask(fileId: $id) {
              id
              file {
                name
              }
            }
          }
        `),
        { id: fileId },
      )
      return result.createContentProcessingTask
    })

    const allResults = await Promise.all(createProcessingTasksPromises)

    return allResults.flatMap((result) => (result ? result : []))
  })

export const dropOutdatedMarkdownFiles = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ fileId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation dropOutdatedMarkdownFiles($fileId: String!) {
          dropOutdatedMarkdowns(fileId: $fileId)
        }
      `),
      data,
    )
  })
