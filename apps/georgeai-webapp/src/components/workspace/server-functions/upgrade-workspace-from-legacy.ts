import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const upgradeWorkspaceFromLegacyMutationDocument = graphql(`
  mutation UpgradeWorkspace($id: String!) {
    upgradeWorkspaceFromLegacy(id: $id)
  }
`)

export const upgradeWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(upgradeWorkspaceFromLegacyMutationDocument, ctx.data)
    return result.upgradeWorkspaceFromLegacy
  })
