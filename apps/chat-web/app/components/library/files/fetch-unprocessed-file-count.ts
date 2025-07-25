import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const fetchUnprocessedFileCount = createServerFn({ method: 'GET' })
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
        query unprocessedFileCount($libraryId: String!) {
          unprocessedFileCount(libraryId: $libraryId)
        }
      `),
      { libraryId: ctx.data.libraryId },
    )
  })

export const getUnprocessedFileCount = (params: { libraryId: string }) =>
  queryOptions({
    queryKey: ['unprocessedFileCount', params.libraryId],
    queryFn: () =>
      fetchUnprocessedFileCount({
        data: { libraryId: params.libraryId },
      }),
  })
