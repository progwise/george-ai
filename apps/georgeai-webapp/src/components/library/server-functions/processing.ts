import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const createEmbeddingTasksFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { fileIds: string[] }) => z.object({ fileIds: z.array(z.string()).nonempty() }).parse(data))
  .handler(async ({ data }) => {
    const createTaskPromises = data.fileIds.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation createEmbeddingTasks($id: String!) {
            createEmbeddingTask(fileId: $id) {
              id
              file {
                name
              }
            }
          }
        `),
        { id: fileId },
      )
      return result.createEmbeddingTask
    })

    return await Promise.all(createTaskPromises)
  })

export const createContentProcessingTasksFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { fileIds: string[] }) => z.object({ fileIds: z.array(z.string()).nonempty() }).parse(data))
  .handler(async ({ data }) => {
    const createProcessingTasksPromises = data.fileIds.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation createContentProcessingTasks($id: String!) {
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
    return await Promise.all(createProcessingTasksPromises)
  })

export const createMissingContentExtractionTasksFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string }) => z.object({ libraryId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) =>
    backendRequest(
      graphql(`
        mutation createMissingContentExtractionTasks($libraryId: String!) {
          createMissingContentExtractionTasks(libraryId: $libraryId) {
            id
            fileId
          }
        }
      `),
      data,
    ),
  )

export const cancelProcessingTaskFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { taskId: string; fileId: string }) =>
    z.object({ taskId: z.string().nonempty(), fileId: z.string().nonempty() }).parse(data),
  )
  .handler(async ({ data }) =>
    backendRequest(
      graphql(`
        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {
          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {
            id
            fileId
          }
        }
      `),
      data,
    ),
  )

export const dropPendingTasksFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string }) => z.object({ libraryId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) =>
    backendRequest(
      graphql(`
        mutation dropPendingTasks($libraryId: String!) {
          dropPendingTasks(libraryId: $libraryId)
        }
      `),
      data,
    ),
  )
