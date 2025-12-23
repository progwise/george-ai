import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const aiProvidersQueryDocument = graphql(`
  query GetAiServiceProviders($enabled: Boolean) {
    aiServiceProviders(enabled: $enabled) {
      id
      createdAt
      updatedAt
      provider
      name
      enabled
      baseUrl
      apiKeyHint
      vramGb
      createdBy
      updatedBy
    }
  }
`)

const getAiProviders = createServerFn({ method: 'GET' })
  .inputValidator((input?: { enabled?: boolean }) => input ?? {})
  .handler(async (ctx) => {
    const { aiServiceProviders } = await backendRequest(aiProvidersQueryDocument, ctx.data)
    return aiServiceProviders
  })

export const getAiProvidersQueryOptions = (enabled?: boolean) =>
  queryOptions({
    queryKey: [queryKeys.AiServiceProviders, { enabled }],
    queryFn: () => getAiProviders({ data: { enabled } }),
  })
