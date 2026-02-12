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
    const { vectorStore } = await backendRequest(
      graphql(`
        query GetWorkspaceVectorStore($workspaceId: String!) {
          vectorStore(workspaceId: $workspaceId) {
            id
            name
            exists
            version
            status
            chunkCount
            warnings
            modelNames
          }
        }
      `),
      data,
    )
    return vectorStore
  })

export const getWorkspaceVectorStoreQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceVectorStore, parameters],
    queryFn: () => (!parameters.workspaceId ? null : getWorkspaceVectorStore({ data: parameters })),
  })
