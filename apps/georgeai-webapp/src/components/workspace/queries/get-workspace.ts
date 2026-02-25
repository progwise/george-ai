import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspaceQueryDocument = graphql(`
  query GetWorkspace($workspaceId: String!) {
    workspace(workspaceId: $workspaceId) {
      id
      name
      slug
      manifest {
        version
        workspaceId
        storageStats {
          extractionBytes
          attachmentBytes
          physicalBytes
          extractionFileCount
          physicalFileCount
          attachmentFileCount
          lastUpdate
          lastReconcile
        }
      }
      role
      chunksCount
      listsCount
      librariesCount
      assistantsCount
      automationsCount
      conversationsCount
      isDefault
      createdAt
      updatedAt
    }
  }
`)

const getWorkspace = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => z.object({ workspaceId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const workspaceResult = await backendRequest(workspaceQueryDocument, data)
    return workspaceResult.workspace
  })

export const getWorkspaceQueryOptions = (parameters: { workspaceId: string }) =>
  queryOptions({
    queryKey: [queryKeys.Workspace, parameters],
    queryFn: () => getWorkspace({ data: parameters }),
  })
