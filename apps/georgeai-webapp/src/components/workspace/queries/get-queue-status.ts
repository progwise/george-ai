import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getQueueStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query GetQueueStatus {
        queueSystemStatus {
          ...QueueSystemStatus_ManagementPanel
          queues {
            queueType
            isRunning
            pendingTasks
            processingTasks
            failedTasks
          }
        }
      }
    `),
  )
  return result.queueSystemStatus
})

export const getQueueStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.QueueStatus],
    queryFn: () => getQueueStatus(),
  })
