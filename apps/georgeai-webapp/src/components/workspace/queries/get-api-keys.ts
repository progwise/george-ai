import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const apiKeysQueryDocument = graphql(`
  query GetApiKeys {
    apiKeys {
      id
      name
      createdAt
      lastUsedAt
      workspaceId
    }
  }
`)

const getApiKeys = createServerFn({ method: 'GET' }).handler(async () => {
  const { apiKeys } = await backendRequest(apiKeysQueryDocument)
  return apiKeys
})

export const getApiKeysQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.ApiKeys],
    queryFn: () => getApiKeys(),
  })
