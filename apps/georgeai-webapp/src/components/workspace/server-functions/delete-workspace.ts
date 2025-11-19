import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const deleteWorkspaceDocument = graphql(`
  mutation DeleteWorkspace($workspaceId: String!) {
    deleteWorkspace(workspaceId: $workspaceId)
  }
`)

export const deleteWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(deleteWorkspaceDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return result.deleteWorkspace
  })
