import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment ConnectorBase on AiConnector {
    id
    name
    connectorType
    isConnected
  }
`)

const getConnectors = createServerFn({ method: 'GET' }).handler(async () =>
  backendRequest(
    graphql(`
      query getConnectors {
        connectors {
          ...ConnectorBase
        }
      }
    `),
    {},
  ),
)

export const getConnectorsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Connectors],
    queryFn: () => getConnectors(),
  })
