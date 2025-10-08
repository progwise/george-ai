import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const clearEnrichmentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; fieldId: string; fileId: string }) => data)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation clearEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {
          clearListEnrichments(listId: $listId, fieldId: $fieldId, fileId: $fileId) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      { listId: data.listId, fieldId: data.fieldId, fileId: data.fileId },
    )
    return result.clearListEnrichments
  })
