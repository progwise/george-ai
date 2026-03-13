import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetLibrariesParameterSchema = z.object({
  workspaceId: z.string(),
})

const getWorkspaceLibraries = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetLibrariesParameterSchema>) => {
    return GetLibrariesParameterSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query GetWorkspaceLibraries($workspaceId: String!) {
          workspaceLibraries(workspaceId: $workspaceId) {
            id
            name
            filesCount
            manifest {
              version
              updated
              created
              creator
              storageStats {
                extractionFileCount
                physicalFileCount
              }
            }
          }
        }
      `),
      data,
    )
    return result.workspaceLibraries
  })

export const getWorkspaceLibrariesQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceLibraries, parameters],
    queryFn: () =>
      !parameters.workspaceId ? null : getWorkspaceLibraries({ data: { workspaceId: parameters.workspaceId } }),
    enabled: !!parameters.workspaceId,
  })
