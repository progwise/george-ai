import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspaceStatsQueryDocument = graphql(`
  query GetWorkspaceStats {
    workspaceStats {
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
const getWorkspaceStatsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { workspaceStats } = await backendRequest(workspaceStatsQueryDocument)
  return workspaceStats
})

export function getWorkspaceStatsQueryOptions() {
  const options = queryOptions({
    queryKey: [queryKeys.WorkspaceStats],
    queryFn: async () => {
      const result = await getWorkspaceStatsFn()
      return result || null
    },
  })
  return options
}
