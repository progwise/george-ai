import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const MigrateLibraryParamsSchema = z.object({
  workspaceId: z.string(),
  libraryId: z.string(),
})

export const migrateLibraryFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof MigrateLibraryParamsSchema>) => MigrateLibraryParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation MigrateLibrary($workspaceId: String!, $libraryId: String!) {
          migrateLibrary(workspaceId: $workspaceId, libraryId: $libraryId) {
            fileMigrationsPublished
            library {
              workspaceId
              libraryId
              version
              name
              created
              storageStats {
                physicalFileCount
                attachmentFileCount
              }
            }
          }
        }
      `),
      data,
    )
    return result.migrateLibrary
  })
