import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getInferenceHostConfig = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await backendRequest(
      graphql(`
        query GetInferenceHostConfig {
          inferenceHostConfig {
            workspaceId
            hostId
            driver
            name
            url
            apiKeyHint
            enabled
            configuredVramGb
            lastUpdate
          }
        }
      `),
      {},
    )
    return result.inferenceHostConfig
  } catch (error) {
    console.error('Failed to get Model Provider status', error)
    throw error
  }
})

export const getInferenceHostConfigQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.InferenceHostConfig],
    queryFn: () => getInferenceHostConfig(),
    staleTime: 30 * 1000, // 30 seconds - AI service status changes frequently
    refetchInterval: false, // Manual refresh only
  })
