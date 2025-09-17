import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getList = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getList($listId: String!) {
          aiList(id: $listId) {
            id
            ...ListsBase
            ...ListEditForm_List
            ...ListSourcesManager_List
            ...ListFieldsTable_List
            ...ListMenu_AiList
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
    refetchInterval: (query) => {
      // Check if there are active enrichments in the current data
      const data = query.state.data as
        | { aiList: { fields: Array<{ pendingItemsCount: number; processingItemsCount: number }> } }
        | undefined
      const hasActiveEnrichments =
        data?.aiList.fields.some((field) => field.pendingItemsCount > 0 || field.processingItemsCount > 0) || false
      return hasActiveEnrichments ? 2000 : false // Poll every 2 seconds if enrichments are active
    },
  })
