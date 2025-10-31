import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiListFilterType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { FieldFilter } from '../use-list-settings'

const startEnrichmentsSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
  fileId: z.string().nonempty().optional(),
  onlyMissingValues: z.boolean().optional(),
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

export const startEnrichmentsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      listId: string
      fieldId: string
      fileId?: string
      onlyMissingValues?: boolean
      filters?: FieldFilter[]
    }) => {
      return startEnrichmentsSchema.parse(data)
    },
  )
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
          $filters: [AiListFilterInput!]
        ) {
          createEnrichmentTasks(
            listId: $listId
            fieldId: $fieldId
            fileId: $fileId
            onlyMissingValues: $onlyMissingValues
            filters: $filters
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
        filters: data.filters,
      },
    )
    return result.createEnrichmentTasks
  })
