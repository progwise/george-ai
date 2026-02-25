import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkspaceProcessStatistics = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    return z.object({ workspaceId: z.string() }).parse(data)
  })
  .handler(async ({ data }) => {
    const { workspaceProcessStatistics } = await backendRequest(
      graphql(`
        query GetWorkspaceProcessStatistics($workspaceId: String!) {
          workspaceProcessStatistics(workspaceId: $workspaceId) {
            requestType
            totalMessages
            processedMessages
            pendingMessages
          }
        }
      `),
      data,
    )
    return workspaceProcessStatistics
  })

export const getWorkspaceProcessStatisticsQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatistics, parameters],
    queryFn: () => (!parameters.workspaceId ? [] : getWorkspaceProcessStatistics({ data: parameters })),
    enabled: !!parameters.workspaceId,
  })
