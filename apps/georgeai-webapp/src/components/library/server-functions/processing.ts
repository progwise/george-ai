import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { EmbeddingRequestInput } from '../../../gql/graphql'
import { EmbeddingRequestInputSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

export const triggerEmbeddingFileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: EmbeddingRequestInput) => EmbeddingRequestInputSchema().parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation triggerFileEmbedding($input: EmbeddingRequestInput!) {
          triggerEmbeddingEvent(input: $input) {
            success
          }
        }
      `),
      { input: data },
    )
    return result.triggerEmbeddingEvent
  })

export const triggerEmbeddingFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: EmbeddingRequestInput[]) => z.array(EmbeddingRequestInputSchema()).parse(data))
  .handler(async ({ data }) => {
    return await Promise.all(
      data.map(async (input) => {
        return backendRequest(
          graphql(`
            mutation triggerFilesEmbedding($input: EmbeddingRequestInput!) {
              triggerEmbeddingEvent(input: $input) {
                success
              }
            }
          `),
          { input },
        )
      }),
    )
  })

export const createContentProcessingTasksFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; fileIds: string[] }) =>
    z.object({ libraryId: z.string().nonempty(), fileIds: z.array(z.string()).nonempty() }).parse(data),
  )
  .handler(async ({ data }) => {
    const createProcessingTasksPromises = data.fileIds.map(async (fileId) => {
      const result = await backendRequest(
        graphql(`
          mutation createContentProcessingTasks($libraryId: String!, $fileId: String!) {
            createContentProcessingTask(libraryId: $libraryId, fileId: $fileId) {
              id
              file {
                name
              }
            }
          }
        `),
        { fileId: fileId, libraryId: data.libraryId },
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
  .inputValidator((data: { taskId: string; libraryId: string }) =>
    z.object({ taskId: z.string().nonempty(), fileId: z.string().nonempty() }).parse(data),
  )
  .handler(async ({ data }) =>
    backendRequest(
      graphql(`
        mutation cancelProcessingTask($taskId: String!, $libraryId: String!) {
          cancelProcessingTask(taskId: $taskId, libraryId: $libraryId) {
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
