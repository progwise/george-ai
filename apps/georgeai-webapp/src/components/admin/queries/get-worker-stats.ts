import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspaceWorkerStatisticsDocument = graphql(`
  query GetWorkspaceWorkerStatistics {
    workspaceWorkerStatistics {
      workspaceId
      eventMessageStatistics {
        extractionRequests {
          totalMessages
          processedMessages
          pendingMessages
        }
        embeddingRequests {
          totalMessages
          processedMessages
          pendingMessages
        }
        embeddingProgress {
          totalMessages
          processedMessages
          pendingMessages
        }
        embeddingFinished {
          totalMessages
          processedMessages
          pendingMessages
        }
      }
    }
  }
`)

const getWorkspaceWorkerStatistics = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { workspaceWorkerStatistics } = await backendRequest(workspaceWorkerStatisticsDocument, ctx.data)
  return workspaceWorkerStatistics
})

export const getWorkspaceWorkerStatistcsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceWorkerStatistics, {}],
    queryFn: () => getWorkspaceWorkerStatistics(),
  })
