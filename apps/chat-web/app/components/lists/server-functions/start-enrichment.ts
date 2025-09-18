import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const startEnrichmentSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
  fileId: z.string().nonempty().optional(),
})

export const startEnrichmentFn = createServerFn({ method: 'POST' })
  .validator((data: { listId: string; fieldId: string; fileId?: string }) => {
    return startEnrichmentSchema.parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const onlyMissingValues = !data.fileId
    const result = await backendRequest(
      graphql(`
        mutation CreateListEnrichmentTasks(
          $listId: String!
          $fieldId: String!
          $fileId: String
          $onlyMissingValues: Boolean
        ) {
          createEnrichmentTasks(
            listId: $listId
            fieldId: $fieldId
            fileId: $fileId
            onlyMissingValues: $onlyMissingValues
          ) {
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
        onlyMissingValues,
      },
    )
    return result.createEnrichmentTasks
  })
