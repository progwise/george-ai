import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetWorkspaceLegacyFilesParameterSchema = z.object({
  workspaceId: z.string(),
})

const getWorkspaceLegacyFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetWorkspaceLegacyFilesParameterSchema>) => {
    return GetWorkspaceLegacyFilesParameterSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query GetLegacyFiles($workspaceId: String!) {
          legacyFiles(workspaceId: $workspaceId) {
            libraryId
            libraryName
            files {
              fileId
              files
              subfolders
              error
            }
          }
        }
      `),
      data,
    )
    return result.legacyFiles
  })

export const getWorkspaceLegacyFilesQueryOptions = (parameters: { workspaceId?: string | null }) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceLegacyFiles, parameters],
    queryFn: () =>
      !parameters.workspaceId ? null : getWorkspaceLegacyFiles({ data: { workspaceId: parameters.workspaceId } }),
    enabled: !!parameters.workspaceId,
  })
