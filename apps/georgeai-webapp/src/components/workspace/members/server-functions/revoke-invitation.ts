import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const revokeWorkspaceInvitationMutationDocument = graphql(`
  mutation RevokeWorkspaceInvitation($invitationId: ID!) {
    revokeWorkspaceInvitation(invitationId: $invitationId)
  }
`)

export const revokeWorkspaceInvitationFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(revokeWorkspaceInvitationMutationDocument, ctx.data)
    return result.revokeWorkspaceInvitation
  })
