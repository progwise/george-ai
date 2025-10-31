import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const stopEnrichmentsSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
})

export const stopEnrichmentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; fieldId: string }) => {
    return stopEnrichmentsSchema.parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(
      graphql(`
        mutation StopListEnrichment($listId: String!, $fieldId: String!) {
          deletePendingEnrichmentTasks(listId: $listId, fieldId: $fieldId) {
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
            createdTasksCount
          }
        }
      `),
      {
        listId: data.listId,
        fieldId: data.fieldId,
      },
    )
    return result.deletePendingEnrichmentTasks
  })
