import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiListFilterType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { FieldFilter } from '../use-list-settings'

const stopEnrichmentsSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
  filters: z
    .array(
      z.object({
        fieldId: z.string().nonempty(),
        filterType: z.nativeEnum(AiListFilterType),
        value: z.string().nonempty(),
      }),
    )
    .optional(),
})

export const stopEnrichmentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; fieldId: string; filters?: FieldFilter[] }) => {
    return stopEnrichmentsSchema.parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(
      graphql(`
        mutation StopListEnrichment($listId: String!, $fieldId: String!, $filters: [AiListFilterInput!]) {
          deletePendingEnrichmentTasks(listId: $listId, fieldId: $fieldId, filters: $filters) {
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
            createdTasksCount
          }
        }
      `),
      {
        listId: data.listId,
        fieldId: data.fieldId,
        filters: data.filters,
      },
    )
    return result.deletePendingEnrichmentTasks
  })
