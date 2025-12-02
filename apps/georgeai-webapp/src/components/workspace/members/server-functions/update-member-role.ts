import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const updateWorkspaceMemberRoleMutationDocument = graphql(`
  mutation UpdateWorkspaceMemberRole($workspaceId: ID!, $userId: ID!, $role: String!) {
    updateWorkspaceMemberRole(workspaceId: $workspaceId, userId: $userId, role: $role) {
      id
      role
    }
  }
`)

export const updateWorkspaceMemberRoleFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string; userId: string; role: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(updateWorkspaceMemberRoleMutationDocument, ctx.data)
    return result.updateWorkspaceMemberRole
  })
