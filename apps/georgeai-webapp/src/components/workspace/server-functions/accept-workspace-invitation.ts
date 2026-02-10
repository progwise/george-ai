import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const acceptWorkspaceInvitationMutationDocument = graphql(`
  mutation AcceptWorkspaceInvitation($invitationId: ID!) {
    acceptWorkspaceInvitation(invitationId: $invitationId) {
      id
      workspace {
        id
        name
      }
    }
  }
`)

export const acceptWorkspaceInvitation = createServerFn({ method: 'POST' })
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(acceptWorkspaceInvitationMutationDocument, {
      invitationId: ctx.data.invitationId,
    })
    return result.acceptWorkspaceInvitation
  })
