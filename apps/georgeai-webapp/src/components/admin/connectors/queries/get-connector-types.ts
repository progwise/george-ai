import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { queryKeys } from '../../../../query-keys'
import { backendRequest } from '../../../../server-functions/backend'

const getConnectorTypes = createServerFn({ method: 'GET' }).handler(async () =>
  backendRequest(
    graphql(`
      query getConnectorTypes {
        connectorTypes {
          id
          name
          description
          icon
          authType
          actions {
            id
            name
            description
            configFields {
              id
              name
              description
              type
              required
              options {
                id
                name
                description
              }
              targetFields {
                id
                name
                description
              }
              transforms {
                id
                name
                description
              }
            }
          }
        }
        workspaceConnectorTypes {
          id
          connectorType
        }
      }
    `),
    {},
  ),
)

export const getConnectorTypesQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Connectors, 'types'],
    queryFn: () => getConnectorTypes(),
  })
