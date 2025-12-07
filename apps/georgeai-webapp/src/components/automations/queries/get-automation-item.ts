import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AutomationItemDetail_AutomationItem on AiAutomationItem {
    id
    createdAt
    updatedAt
    automationId
    listItemId
    inScope
    status
    lastExecutedAt
    preview {
      targetField
      value
      transformedValue
    }
    listItem {
      id
      itemName
      listId
    }
    executions {
      id
      status
      inputJson
      outputJson
      startedAt
      finishedAt
      batchId
    }
  }
`)

const getAutomationItem = createServerFn({ method: 'GET' })
  .inputValidator((data: { itemId: string }) => data)
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getAutomationItem($itemId: ID!) {
          automationItem(id: $itemId) {
            ...AutomationItemDetail_AutomationItem
          }
        }
      `),
      { itemId: ctx.data.itemId },
    ),
  )

export const getAutomationItemQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: [queryKeys.AutomationItem, itemId],
    queryFn: () => getAutomationItem({ data: { itemId } }),
  })
