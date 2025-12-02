import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const workspaceInvitationsQueryDocument = graphql(`
  query GetWorkspaceInvitations($workspaceId: ID!) {
    workspaceInvitations(workspaceId: $workspaceId) {
      id
      email
      createdAt
      expiresAt
      inviter {
        id
        name
        email
      }
    }
  }
`)

const getWorkspaceInvitations = createServerFn({ method: 'GET' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const { workspaceInvitations } = await backendRequest(workspaceInvitationsQueryDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return workspaceInvitations
  })

export const getWorkspaceInvitationsQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ['workspaceInvitations', workspaceId],
    queryFn: () => getWorkspaceInvitations({ data: { workspaceId } }),
    enabled: !!workspaceId,
  })
