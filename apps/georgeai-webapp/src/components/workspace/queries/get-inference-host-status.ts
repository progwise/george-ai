import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getInferenceHostStatus = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await backendRequest(
      graphql(`
        query GetInferenceHostStatus {
          inferenceHostState {
            hostId
            state
            driver
            url
            apiKey
            totalMemoryMb
            usedMemoryMb
            processorUsagePercent
            lastHealthCheck
            lastTestConnection
            models {
              modelName
              callCount
              errorCount
              responseTimeMsPerToken
            }
          }
        }
      `),
      {},
    )
    return result.inferenceHostState
  } catch (error) {
    console.error('Failed to get Model Provider status', error)
    throw error
  }
})

export const getInferenceHostStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.InferenceHostStatus],
    queryFn: () => getInferenceHostStatus(),
    staleTime: 30 * 1000, // 30 seconds - AI service status changes frequently
    refetchInterval: false, // Manual refresh only
  })
