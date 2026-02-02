import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getEventProcessingStatistics = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { workspaceStatistics } = await backendRequest(
    graphql(`
      query GetEventProcessingStatistics {
        workspaceStatistics {
          workspaceId
          statistics {
            actionType
            totalMessages
            processedMessages
            pendingMessages
          }
        }
      }
    `),
    ctx.data,
  )
  return workspaceStatistics
})

export const getEventProcessingStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatistics, {}],
    queryFn: () => getEventProcessingStatistics(),
  })
