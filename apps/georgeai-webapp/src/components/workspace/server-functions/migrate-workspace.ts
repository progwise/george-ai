import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const MigrateWorkspaceParamsSchema = z.object({
  workspaceId: z.string(),
})

export const migrateWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof MigrateWorkspaceParamsSchema>) => MigrateWorkspaceParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation MigrateWorkspace($workspaceId: String!) {
          migrateWorkspace(workspaceId: $workspaceId) {
            workspaceId
            version
            name
            created
            storageStats {
              physicalFileCount
              attachmentFileCount
            }
          }
        }
      `),
      data,
    )
    return result.migrateWorkspace
  })
