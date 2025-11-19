import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const validateWorkspaceDeletionDocument = graphql(`
  mutation ValidateWorkspaceDeletion($workspaceId: String!) {
    validateWorkspaceDeletion(workspaceId: $workspaceId) {
      canDelete
      libraryCount
      assistantCount
      listCount
      message
    }
  }
`)

export const validateWorkspaceDeletionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(validateWorkspaceDeletionDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return result.validateWorkspaceDeletion
  })
