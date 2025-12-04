import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { EnrichmentStatus } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const QueryEnrichmentsArgsSchema = z.object({
  listId: z.string().optional(),
  itemId: z.string().optional(),
  fieldId: z.string().optional(),
  take: z.number().min(0).max(100).default(20),
  skip: z.number().min(0).default(0),
  status: z.nativeEnum(EnrichmentStatus).optional(),
})

const getEnrichments = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof QueryEnrichmentsArgsSchema>) => QueryEnrichmentsArgsSchema.parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getEnrichments(
          $listId: String
          $itemId: String
          $fieldId: String
          $take: Int!
          $skip: Int!
          $status: EnrichmentStatus
        ) {
          aiListEnrichments(
            listId: $listId
            itemId: $itemId
            fieldId: $fieldId
            take: $take
            skip: $skip
            status: $status
          ) {
            listId
            itemId
            fieldId
            take
            skip
            status
            totalCount
            statusCounts {
              status
              count
            }
            enrichments {
              id
              ...EnrichmentAccordionItem_Enrichment
            }
          }
        }
      `),
      ctx.data,
    ),
  )

export const getEnrichmentsQueryOptions = (args: {
  listId?: string
  itemId?: string
  fieldId?: string
  take: number
  skip: number
  status?: EnrichmentStatus
}) =>
  queryOptions({
    queryKey: ['getEnrichments', args],
    queryFn: () => getEnrichments({ data: args }),
    refetchInterval: (query) => {
      // Check if there are active enrichments in the current data
      const data = query.state.data
      const hasActiveEnrichments =
        data?.aiListEnrichments.statusCounts.some(
          (statusCount) =>
            (statusCount.status === EnrichmentStatus.Processing || statusCount.status === EnrichmentStatus.Pending) &&
            statusCount.count > 0,
        ) || false
      return hasActiveEnrichments ? 2000 : false // Poll every 2 seconds if enrichments are active
    },
  })
