import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment ListsBase on AiList {
    id
    name
    createdAt
    updatedAt
  }
`)

const getLists = createServerFn({ method: 'GET' }).handler(async (ctx) =>
  backendRequest(
    graphql(`
      query getUserLists {
        aiLists {
          ...ListsBase
        }
      }
    `),
    ctx.data,
  ),
)

export const getListsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.AiLists],
    queryFn: () => getLists(),
  })
