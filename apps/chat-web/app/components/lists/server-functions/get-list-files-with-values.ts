import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'
import { FieldFilter } from '../use-list-filters'

const getListFilesWithValuesSchema = z.object({
  listId: z.string().nonempty(),
  skip: z.number().min(0).optional().default(0),
  take: z.number().min(1).max(100).optional().default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  fieldIds: z.array(z.string()),
  filters: z.array(
    z.object({
      fieldId: z.string().nonempty(),
      filterType: z.enum(['equals', 'starts_with', 'ends_with', 'contains', 'not_contains']),
      value: z.string().nonempty(),
    }),
  ),
})

const listFilesWithValuesDocument = graphql(`
  query aiListFilesWithValues(
    $listId: String!
    $skip: Int!
    $take: Int!
    $orderBy: String
    $orderDirection: String
    $fieldIds: [String!]!
    $filters: [AiListFilterInput!]!
  ) {
    aiListItems(
      listId: $listId
      fieldIds: $fieldIds
      filters: $filters
      skip: $skip
      take: $take
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      count
      take
      skip
      orderBy
      orderDirection
      items {
        origin {
          id
          type
          name
          libraryId
          libraryName
        }
        values {
          fieldId
          fieldName
          displayValue
          enrichmentErrorMessage
          queueStatus
        }
      }
    }
  }
`)

const getListFilesWithValues = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      listId: string
      skip?: number
      take?: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      fieldIds: string[]
      filters: FieldFilter[]
    }) => getListFilesWithValuesSchema.parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(listFilesWithValuesDocument, ctx.data)
  })

export const getListFilesWithValuesQueryOptions = (params: {
  listId: string
  skip?: number
  take?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  fieldIds: string[]
  filters: FieldFilter[]
  hasActiveEnrichments: boolean
}) =>
  queryOptions({
    queryKey: ['AiListFilesWithValues', params],
    queryFn: () => getListFilesWithValues({ data: params }),
    refetchInterval: params.hasActiveEnrichments ? 2000 : false, // Poll every 2 seconds if enrichments are active
  })
