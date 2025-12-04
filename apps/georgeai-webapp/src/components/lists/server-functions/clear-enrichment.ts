import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const clearEnrichmentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; fieldId: string; itemId: string }) => data)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation clearEnrichment($listId: String!, $fieldId: String!, $itemId: String!) {
          clearListEnrichments(listId: $listId, fieldId: $fieldId, itemId: $itemId) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      { listId: data.listId, fieldId: data.fieldId, itemId: data.itemId },
    )
    return result.clearListEnrichments
  })
