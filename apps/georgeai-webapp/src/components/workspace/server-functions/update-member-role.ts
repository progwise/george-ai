import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const updateWorkspaceMemberRoleFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string; userId: string; role: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation UpdateWorkspaceMemberRole($workspaceId: ID!, $userId: ID!, $role: WorkspaceRole!) {
          changeWorkspaceMembership(workspaceId: $workspaceId, userId: $userId, role: $role) {
            id
            role
            user {
              id
              name
              email
            }
          }
        }
      `),
      ctx.data,
    )
    return result.changeWorkspaceMembership
  })
