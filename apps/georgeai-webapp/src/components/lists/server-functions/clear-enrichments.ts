import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const clearEnrichmentsSchema = z.object({
  listId: z.string().min(1),
  fieldId: z.string().min(1),
  itemId: z.string().min(1).optional(),
})

export const clearEnrichmentsFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { listId: string; fieldId: string; itemId?: string }) => {
    return clearEnrichmentsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation ClearEnrichments($listId: String!, $fieldId: String!, $itemId: String) {
          clearListEnrichments(listId: $listId, fieldId: $fieldId, itemId: $itemId) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      {
        listId: data.listId,
        fieldId: data.fieldId,
        itemId: data.itemId,
      },
    )

    return result.clearListEnrichments
  })
