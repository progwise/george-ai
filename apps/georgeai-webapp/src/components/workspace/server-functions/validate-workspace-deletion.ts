import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
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

const validateWorkspaceDeletionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(validateWorkspaceDeletionDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return result.validateWorkspaceDeletion
  })

export const workspaceDeleteValidationQueryOptions = (workspaceId?: string) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceDeletionValidation, workspaceId],
    queryFn: () => (workspaceId ? validateWorkspaceDeletionFn({ data: { workspaceId } }) : null),
    enabled: !!workspaceId,
  })
