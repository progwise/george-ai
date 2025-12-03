import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const removeWorkspaceMemberMutationDocument = graphql(`
  mutation RemoveWorkspaceMember($workspaceId: ID!, $userId: ID!) {
    removeWorkspaceMember(workspaceId: $workspaceId, userId: $userId) {
      id
      user {
        id
        name
        email
      }
    }
  }
`)

export const removeWorkspaceMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string; userId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(removeWorkspaceMemberMutationDocument, ctx.data)
    return result.removeWorkspaceMember
  })
