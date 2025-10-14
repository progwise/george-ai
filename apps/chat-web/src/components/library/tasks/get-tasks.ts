import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { ProcessingStatus } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const getProcessingTasks = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        fileId: z.string().optional(),
        status: z.nativeEnum(ProcessingStatus).optional(),
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query GetContentProcessingTasks(
          $libraryId: String!
          $fileId: String
          $status: ProcessingStatus
          $skip: Int
          $take: Int
        ) {
          aiContentProcessingTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {
            count
            statusCounts {
              status
              count
            }
            tasks {
              ...AiContentProcessingTask_AccordionItem
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const getProcessingTasksQueryOptions = (params: {
  libraryId: string
  fileId?: string
  status?: ProcessingStatus
  skip?: number
  take?: number
}) =>
  queryOptions({
    queryKey: ['LibraryTasks', { ...params }],
    queryFn: async () =>
      getProcessingTasks({
        data: {
          libraryId: params.libraryId,
          fileId: params.fileId,
          status: params.status,
          skip: params.skip,
          take: params.take,
        },
      }),
    refetchInterval(query) {
      return query.state.data?.aiContentProcessingTasks.tasks.some(
        (task) =>
          task.processingStatus !== ProcessingStatus.Completed &&
          task.processingStatus !== ProcessingStatus.Failed &&
          task.processingStatus !== ProcessingStatus.Cancelled &&
          task.processingStatus !== ProcessingStatus.TimedOut,
      )
        ? 5000
        : false
    },
  })
