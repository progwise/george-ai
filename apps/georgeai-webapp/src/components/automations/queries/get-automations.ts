import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AutomationsBase on AiAutomation {
    id
    createdAt
    updatedAt
    name
    listId
    connectorId
    connectorAction
    executeOnEnrichment
  }
`)

const getAutomations = createServerFn({ method: 'GET' }).handler(async () =>
  backendRequest(
    graphql(`
      query getAutomations {
        automations {
          ...AutomationsBase
          ...AutomationMenu_Automation
        }
      }
    `),
    {},
  ),
)

export const getAutomationsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Automations],
    queryFn: () => getAutomations(),
  })
