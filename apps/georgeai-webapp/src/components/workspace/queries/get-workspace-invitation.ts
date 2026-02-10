import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkspaceInvitation = createServerFn({ method: 'GET' })
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query WorkspaceInvitation($id: ID!) {
          workspaceInvitation(invitationId: $id) {
            id
            email
            expiresAt
            acceptedAt
            workspace {
              id
              name
            }
            inviter {
              name
              email
            }
          }
        }
      `),
      { id: ctx.data.invitationId },
    )
    return result.workspaceInvitation ?? null
  })

export const getWorkspaceInvitationQueryOptions = (invitationId: string) => ({
  queryKey: [queryKeys.WorkspaceInvitations, invitationId],
  queryFn: () => getWorkspaceInvitation({ data: { invitationId } }),
})
