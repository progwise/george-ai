import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { queryKeys } from '../../../../query-keys'
import { backendRequest } from '../../../../server-functions/backend'

const workspaceMembersQueryDocument = graphql(`
  query GetWorkspaceMembers($workspaceId: ID!) {
    workspaceMembers(workspaceId: $workspaceId) {
      id
      role
      createdAt
      user {
        id
        name
        email
        username
        avatarUrl
      }
    }
  }
`)

const getWorkspaceMembers = createServerFn({ method: 'GET' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const { workspaceMembers } = await backendRequest(workspaceMembersQueryDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return workspaceMembers
  })

export const getWorkspaceMembersQueryOptions = (workspaceId?: string) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceMembers, workspaceId],
    queryFn: () => (workspaceId ? getWorkspaceMembers({ data: { workspaceId } }) : null),
    enabled: !!workspaceId,
  })
