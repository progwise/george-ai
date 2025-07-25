import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const fetchUnprocessedFilesInQueueCount = createServerFn({ method: 'GET' })
  .validator(() => ({}))
  .handler(async () => {
    return await backendRequest(
      graphql(`
        query unprocessedFilesInQueueCount {
          unprocessedFilesInQueueCount
        }
      `),
      {},
    )
  })

export const countUnprocessedFilesInQueue = () =>
  queryOptions({
    queryKey: ['unprocessedFilesInQueueCount'],
    queryFn: () => fetchUnprocessedFilesInQueueCount(),
  })

const fetchUnprocessedFilesCount = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query unprocessedFilesCount($libraryId: String!) {
          unprocessedFilesCount(libraryId: $libraryId)
        }
      `),
      { libraryId: ctx.data.libraryId },
    )
  })

export const getUnprocessedFilesCount = (params: { libraryId: string }) =>
  queryOptions({
    queryKey: ['unprocessedFileCount', params.libraryId],
    queryFn: () =>
      fetchUnprocessedFilesCount({
        data: { libraryId: params.libraryId },
      }),
  })
