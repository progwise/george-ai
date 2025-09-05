import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const getAiServiceStatus = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await backendRequest(
      graphql(`
        query GetAiServiceStatus {
          aiServiceStatus {
            instances {
              id
              url
              type
              available
              responseTime
              loadScore
              runningModels {
                name
                size
                memoryUsage
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
              resourceUsage {
                totalMemory
                usedMemory
                availableMemory
                safeMemory
                maxConcurrency
                utilizationPercentage
                memoryType
              }
              currentConcurrency
              queueLength
              maxQueueLength
              version
              error
            }
            totalInstances
            availableInstances
            healthyInstances
            totalMemory
            totalUsedMemory
            totalMaxConcurrency
            bestInstanceId
            serviceTypes
            lastUpdated
          }
        }
      `),
      {},
    )
    return result.aiServiceStatus
  } catch (error) {
    console.error('Failed to fetch AI service status:', error)
    throw error
  }
})

export const getAiServiceStatusQueryOptions = () =>
  queryOptions({
    queryKey: ['ai-service-status'],
    queryFn: () => getAiServiceStatus(),
    staleTime: 30 * 1000, // 30 seconds - AI service status changes frequently
    refetchInterval: false, // Manual refresh only
  })
