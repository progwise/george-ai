import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { ProcessingStatus } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const getLibraryTasks = createServerFn({ method: 'GET' })
  .validator((data: object) =>
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
        query GetContentExtractionTasks(
          $libraryId: String!
          $fileId: String
          $status: ProcessingStatus
          $skip: Int
          $take: Int
        ) {
          aiContentExtractionTasks(libraryId: $libraryId, fileId: $fileId, status: $status, skip: $skip, take: $take) {
            count
            tasks {
              ...AiContentExtractionTask_AccordionItem
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const getExtractionTasksQueryOptions = (params: {
  libraryId: string
  fileId?: string
  status?: ProcessingStatus
  skip?: number
  take?: number
}) =>
  queryOptions({
    queryKey: ['LibraryTasks', { ...params }],
    queryFn: async () =>
      getLibraryTasks({
        data: {
          libraryId: params.libraryId,
          fileId: params.fileId,
          status: params.status,
          skip: params.skip,
          take: params.take,
        },
      }),
  })
