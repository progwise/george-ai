import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const eventProcessingStatisticsDocument = graphql(`
  query GetEventProcessingStatistics {
    workspaceStatistics {
      workspaceId
      statistics {
        processType
        totalMessages
        processedMessages
        pendingMessages
      }
    }
  }
`)

const getEventProcessingStatistics = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { workspaceStatistics } = await backendRequest(eventProcessingStatisticsDocument, ctx.data)
  return workspaceStatistics
})

export const getEventProcessingStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatistics, {}],
    queryFn: () => getEventProcessingStatistics(),
  })
