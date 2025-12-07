import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AutomationItemList_AutomationItem on AiAutomationItem {
    id
    createdAt
    updatedAt
    automationId
    listItemId
    inScope
    status
    listItem {
      id
      itemName
      listId
    }
  }
`)

interface GetAutomationItemsParams {
  automationId: string
  inScope?: boolean
  status?: string
  skip?: number
  take?: number
}

const getAutomationItems = createServerFn({ method: 'GET' })
  .inputValidator((data: GetAutomationItemsParams) => data)
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getAutomationItems($automationId: ID!, $inScope: Boolean, $status: String, $skip: Int, $take: Int) {
          automationItems(automationId: $automationId, inScope: $inScope, status: $status, skip: $skip, take: $take) {
            totalCount
            skip
            take
            items {
              ...AutomationItemList_AutomationItem
            }
          }
        }
      `),
      {
        automationId: ctx.data.automationId,
        inScope: ctx.data.inScope,
        status: ctx.data.status,
        skip: ctx.data.skip,
        take: ctx.data.take,
      },
    ),
  )

export const getAutomationItemsQueryOptions = (params: GetAutomationItemsParams) =>
  queryOptions({
    queryKey: [queryKeys.AutomationItems, params],
    queryFn: () => getAutomationItems({ data: params }),
  })
