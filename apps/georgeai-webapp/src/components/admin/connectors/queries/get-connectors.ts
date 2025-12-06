import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { queryKeys } from '../../../../query-keys'
import { backendRequest } from '../../../../server-functions/backend'

graphql(`
  fragment ConnectorDetail on AiConnector {
    id
    name
    connectorType
    baseUrl
    isConnected
    lastTestedAt
    lastError
    createdAt
  }
`)

const getConnectors = createServerFn({ method: 'GET' }).handler(async () =>
  backendRequest(
    graphql(`
      query getConnectorsAdmin {
        connectors {
          ...ConnectorDetail
        }
      }
    `),
    {},
  ),
)

export const getConnectorsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Connectors, 'admin'],
    queryFn: () => getConnectors(),
  })
