import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiListFilterType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { FieldFilter } from '../use-list-settings'

const clearEnrichmentsSchema = z.object({
  listId: z.string().min(1),
  fieldId: z.string().min(1),
  itemId: z.string().min(1).optional(),
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

export const clearEnrichmentsFn = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { listId: string; fieldId: string; itemId?: string; filters?: FieldFilter[] }) => {
    return clearEnrichmentsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation ClearEnrichments(
          $listId: String!
          $fieldId: String!
          $itemId: String
          $filters: [AiListFilterInput!]
        ) {
          clearListEnrichments(listId: $listId, fieldId: $fieldId, itemId: $itemId, filters: $filters) {
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
        filters: data.filters,
      },
    )

    return result.clearListEnrichments
  })
