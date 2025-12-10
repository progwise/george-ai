import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AutomationDetail on AiAutomation {
    id
    createdAt
    updatedAt
    name
    listId
    connectorId
    connectorAction
    connectorActionConfig {
      values {
        key
        value
      }
      fieldMappings {
        sourceFieldId
        targetField
        transform
      }
    }
    schedule
    executeOnEnrichment
    list {
      id
      name
      fields {
        id
        name
        type
        sourceType
      }
    }
    connector {
      id
      name
      baseUrl
      connectorType
    }
  }
`)

const getAutomation = createServerFn({ method: 'GET' })
  .inputValidator((data: { automationId: string }) => data)
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getAutomation($id: ID!) {
          automation(id: $id) {
            ...AutomationDetail
          }
        }
      `),
      { id: ctx.data.automationId },
    ),
  )

export const getAutomationQueryOptions = (automationId: string) =>
  queryOptions({
    queryKey: [queryKeys.Automation, { automationId }],
    queryFn: () => getAutomation({ data: { automationId } }),
  })
