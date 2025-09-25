import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const clearEnrichmentsSchema = z.object({
  listId: z.string().min(1),
  fieldId: z.string().min(1),
  fileId: z.string().min(1).optional(),
})

export const clearEnrichmentsFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { listId: string; fieldId: string; fileId?: string }) => {
    return clearEnrichmentsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation ClearEnrichments($listId: String!, $fieldId: String!, $fileId: String) {
          clearListEnrichments(listId: $listId, fieldId: $fieldId, fileId: $fileId) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      {
        listId: data.listId,
        fieldId: data.fieldId,
        fileId: data.fileId,
      },
    )

    return result.clearListEnrichments
  })
