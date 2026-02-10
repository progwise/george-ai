import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const ModelProvidersDocument = graphql(`
  query GetAiServiceProviders($enabled: Boolean) {
    modelProviders(enabled: $enabled) {
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

const getModelProviders = createServerFn({ method: 'GET' })
  .inputValidator((input?: { enabled?: boolean }) => input ?? {})
  .handler(async (ctx) => {
    const { modelProviders } = await backendRequest(ModelProvidersDocument, ctx.data)
    return modelProviders
  })

export const getModelProvidersQueryOptions = (enabled?: boolean) =>
  queryOptions({
    queryKey: [queryKeys.ModelProviders, { enabled }],
    queryFn: () => getModelProviders({ data: { enabled } }),
  })
