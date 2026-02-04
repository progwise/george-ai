import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspaceStatsQueryDocument = graphql(`
  query GetWorkspaceStats($workspaceId: String!) {
    workspaceStats(workspaceId: $workspaceId) {
      id
      name
      slug
      isDefault
      isAdmin
      roles
      memberCount
      embeddingInfo {
        extractionMethod
        modelName
        chunkCount
      }
      workspaceInfo {
        version
        settings {
          storageLimitFiles
          storageLimitBytes
          embedding {
            embeddingModelProvider
            embeddingModelName
          }
          imageAnalysis {
            imageAnalysisModelProvider
            imageAnalysisModelName
          }
        }
        usage {
          sourceBytes
          extractedBytes
          activeExtractedBytes
          physicalBytes
          sourceFiles
          extractions
          activeExtractions
          physicalFiles
          lastReconcile
        }
      }
    }
  }
`)
const getWorkspaceStatsFn = createServerFn({ method: 'GET' })
  .inputValidator((data) => z.object({ workspaceId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { workspaceStats } = await backendRequest(workspaceStatsQueryDocument, { ...data })
    return workspaceStats
  })

export function getWorkspaceStatsQueryOptions({ workspaceId }: { workspaceId: string | null }) {
  const options = queryOptions({
    queryKey: [queryKeys.WorkspaceStats, { workspaceId: workspaceId || 'null' }],
    queryFn: async () => {
      if (!workspaceId) return null
      const result = await getWorkspaceStatsFn({ data: { workspaceId } })
      return result || null
    },
    enabled: !!workspaceId,
  })
  return options
}
