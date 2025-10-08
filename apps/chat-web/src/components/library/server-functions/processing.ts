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
