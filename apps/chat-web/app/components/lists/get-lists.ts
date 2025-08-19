import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment ListsBase on AiList {
    id
    ownerId
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
          ...ListSelector_List
          ...ListDeleteButton_List
        }
      }
    `),
    ctx.data,
  ),
)

export const getListsQueryOptions = () =>
  queryOptions({
    queryKey: ['AiLists'],
    queryFn: () => getLists(),
  })
