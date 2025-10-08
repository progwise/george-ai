import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const startEnrichmentSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
  fileId: z.string().nonempty(),
})

export const startEnrichmentFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: { listId: string; fieldId: string; fileId: string }) => {
    return startEnrichmentSchema.parse(data)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    const result = await backendRequest(
      graphql(`
        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {
          createEnrichmentTasks(listId: $listId, fieldId: $fieldId, fileId: $fileId, onlyMissingValues: false) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      data,
    )
    return result.createEnrichmentTasks
  })
