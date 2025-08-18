import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getListFilesWithValuesSchema = z.object({
  listId: z.string().nonempty(),
  skip: z.number().min(0).optional().default(0),
  take: z.number().min(1).max(100).optional().default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  fieldIds: z.array(z.string()),
  language: z.string(),
})

const listFilesWithValuesDocument = graphql(`
  query aiListFilesWithValues(
    $listId: String!
    $skip: Int!
    $take: Int!
    $orderBy: String
    $orderDirection: String
    $fieldIds: [String!]!
    $language: String!
  ) {
    aiListFiles(listId: $listId, skip: $skip, take: $take, orderBy: $orderBy, orderDirection: $orderDirection) {
      listId
      count
      take
      skip
      orderBy
      orderDirection
      files {
        id
        name
        libraryId
        fieldValues(fieldIds: $fieldIds, language: $language) {
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
      language: string
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
  language: string
  hasActiveEnrichments: boolean
}) =>
  queryOptions({
    queryKey: ['AiListFilesWithValues', params],
    queryFn: () => getListFilesWithValues({ data: params }),
    refetchInterval: params.hasActiveEnrichments ? 2000 : false, // Poll every 2 seconds if enrichments are active
  })
