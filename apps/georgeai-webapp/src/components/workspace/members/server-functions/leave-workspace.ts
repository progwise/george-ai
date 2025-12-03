import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const leaveWorkspaceMutationDocument = graphql(`
  mutation LeaveWorkspace($workspaceId: ID!) {
    leaveWorkspace(workspaceId: $workspaceId)
  }
`)

export const leaveWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(leaveWorkspaceMutationDocument, ctx.data)
    return result.leaveWorkspace
  })
