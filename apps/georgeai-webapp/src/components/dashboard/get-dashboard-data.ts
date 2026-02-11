import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const dashboardDataDocument = graphql(`
  query GetDashboardData {
    modelProviderStatus {
      instances {
        name
        url
        type
        isOnline
        version
        totalVram
        usedVram
        runningModels {
          name
          size
        }
        availableModels {
          name
          size
        }
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
    queueSystemStatus {
      queues {
        queueType
        isRunning
        pendingTasks
        processingTasks
        failedTasks
      }
    }
  }
`)

const getDashboardData = createServerFn({ method: 'GET' }).handler(() => backendRequest(dashboardDataDocument))

export const getDashboardDataQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.UserDashboard],
    queryFn: () => getDashboardData(),
  })
