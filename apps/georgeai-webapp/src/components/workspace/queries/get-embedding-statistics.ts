import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkspaceEmbeddingStatistics = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.object({ workspaceId: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    const { embeddingStatistics } = await backendRequest(
      graphql(`
        query GetWorkspaceEmbeddingStatistics($workspaceId: String!) {
          embeddingStatistics(workspaceId: $workspaceId) {
            extractionMethod
            modelName
            chunkCount
          }
        }
      `),
      data,
    )
    return embeddingStatistics || []
  })

export const getWorkspaceEmbeddingStatisticsQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.EmbeddingStatistics, { ...parameters }],
    queryFn: () =>
      !parameters.workspaceId ? [] : getWorkspaceEmbeddingStatistics({ data: { workspaceId: parameters.workspaceId } }),
  })
