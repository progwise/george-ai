import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getList = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getList($listId: String!) {
          aiList(id: $listId) {
            ...ListsBase
            ...ListEditForm_List
            ...ListSourcesManager_List
            ...ListFieldsTable_List
          }
        }
      `),
      {
        listId: ctx.data,
      },
    ),
  )

export const getListQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ['AiList', { listId }],
    queryFn: () => getList({ data: listId }),
  })
