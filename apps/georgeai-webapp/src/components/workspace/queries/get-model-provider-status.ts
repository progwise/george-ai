import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getModelProviderStatus = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await backendRequest(
      graphql(`
        query GetModelProviderStatus {
          modelProviderStatus {
            instances {
              name
              url
              type
              isOnline
              version
              runningModels {
                name
                size
                expiresAt
                activeRequests
              }
              availableModels {
                name
                size
                capabilities
                family
                parameterSize
              }
              totalVram
              usedVram
              modelQueues {
                modelName
                queueLength
                maxConcurrency
                estimatedRequestSize
              }
            }
            totalInstances
            availableInstances
            healthyInstances
            totalMemory
            totalUsedMemory
            totalMaxConcurrency
            totalQueueLength
          }
        }
      `),
      {},
    )
    return result.modelProviderStatus
  } catch (error) {
    console.error('Failed to fetch AI service status:', error)
    throw error
  }
})

export const getModelProviderStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.ModelProviderStatus],
    queryFn: () => getModelProviderStatus(),
    staleTime: 30 * 1000, // 30 seconds - AI service status changes frequently
    refetchInterval: false, // Manual refresh only
  })
