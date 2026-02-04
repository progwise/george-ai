import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const migrateWorkspaceMutationDocument = graphql(`
  mutation MigrateWorkspace($workspaceId: String!) {
    migrateWorkspace(id: $workspaceId)
  }
`)

export const migrateWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(migrateWorkspaceMutationDocument, ctx.data)
    return result.migrateWorkspace
  })
