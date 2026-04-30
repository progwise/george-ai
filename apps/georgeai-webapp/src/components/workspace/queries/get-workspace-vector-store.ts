import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkspaceVectorStore = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    return z.object({ workspaceId: z.string() }).parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query GetWorkspaceVectorStore($workspaceId: String!) {
          vectorStore(workspaceId: $workspaceId) {
            workspaceId
            name
            exists
            version
            status
            chunkCount
            warnings
          }
        }
      `),
      data,
    )
    return result.vectorStore
  })

export const getWorkspaceVectorStoreQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceVectorStore, parameters],
    queryFn: () => getWorkspaceVectorStore({ data: parameters }),
    enabled: !!parameters.workspaceId,
  })
