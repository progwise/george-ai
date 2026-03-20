import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetWorkspaceManifestParameterSchema = z.object({
  workspaceId: z.string(),
})

const getWorkspaceManifest = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetWorkspaceManifestParameterSchema>) =>
    GetWorkspaceManifestParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const workspaceResult = await backendRequest(
      graphql(`
        query GetWorkspaceManifest($workspaceId: String!) {
          workspaceManifest(workspaceId: $workspaceId) {
            workspaceId
            version
            name
            created
            settings {
              embedding {
                modelDriver
                modelName
              }
              vision {
                modelDriver
                modelName
              }
            }
          }
        }
      `),
      data,
    )
    return workspaceResult.workspaceManifest
  })

export const getWorkspaceManifestQueryOptions = (parameters: { workspaceId: string }) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceManifest, parameters],
    queryFn: () => getWorkspaceManifest({ data: parameters }),
  })
