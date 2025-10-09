import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiListFilterType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { FieldFilter, FieldSorting } from '../use-list-settings'

const getListItemsSchema = z.object({
  listId: z.string().nonempty(),
  skip: z.number().min(0).optional().default(0),
  take: z.number().min(1).max(100).optional().default(20),
  fieldIds: z.array(z.string()),
  filters: z.array(
    z.object({
      fieldId: z.string().nonempty(),
      filterType: z.nativeEnum(AiListFilterType),
      value: z.string().nonempty(),
    }),
  ),
  sorting: z.array(
    z.object({
      fieldId: z.string().nonempty(),
      direction: z.enum(['asc', 'desc']),
    }),
  ),
})

const getListItemsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      listId: string
      skip?: number
      take?: number
      sorting?: FieldSorting[]
      fieldIds: string[]
      filters: FieldFilter[]
    }) => getListItemsSchema.parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query getListItems(
          $listId: String!
          $skip: Int!
          $take: Int!
          $sorting: [AiListSortingInput!]
          $fieldIds: [String!]!
          $filters: [AiListFilterInput!]!
        ) {
          aiListItems(
            listId: $listId
            fieldIds: $fieldIds
            filters: $filters
            skip: $skip
            take: $take
            sorting: $sorting
          ) {
            unfilteredCount
            count
            ...ListFilesTable_FilesQueryResult
          }
        }
      `),
      ctx.data,
    )
    return result.aiListItems
  })

export const getListItemsQueryOptions = (params: {
  listId: string
  skip?: number
  take?: number
  sorting: FieldSorting[]
  fieldIds: string[]
  filters: FieldFilter[]
}) =>
  queryOptions({
    queryKey: ['AiListFilesWithValues', params],
    queryFn: () => getListItemsFn({ data: params }),
    refetchInterval: (query) => {
      return query.state.data?.items.some((item) =>
        item.values.some(
          (value) =>
            value.queueStatus === 'pending' || value.queueStatus === 'processing' || value.queueStatus === 'queued',
        ),
      )
        ? 2000
        : false //
    }, // Poll every 2 seconds if enrichments are active
  })
