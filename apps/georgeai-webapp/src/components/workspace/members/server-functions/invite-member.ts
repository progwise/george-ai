import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const inviteWorkspaceMemberMutationDocument = graphql(`
  mutation InviteWorkspaceMember($workspaceId: ID!, $email: String!) {
    inviteWorkspaceMember(workspaceId: $workspaceId, email: $email) {
      id
      email
      createdAt
      expiresAt
    }
  }
`)

export const inviteWorkspaceMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string; email: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(inviteWorkspaceMemberMutationDocument, ctx.data)
    return result.inviteWorkspaceMember
  })
