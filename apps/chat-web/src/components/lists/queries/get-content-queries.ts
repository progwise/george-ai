import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getContentQueries = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        listId: z.string().optional(),
        libraryId: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getContentQueries($listId: String, $libraryId: String) {
          aiContentQueries(listId: $listId, libraryId: $libraryId) {
            fieldId
            fieldName
            listId
            listName
            contentQuery
          }
        }
      `),
      data,
    )
    return result
  })

export const getContentQueriesQueryOptions = (params: { listId?: string; libraryId?: string }) => ({
  queryKey: ['contentQueries', { ...params }],
  queryFn: () =>
    getContentQueries({
      data: { ...params },
    }),
})
