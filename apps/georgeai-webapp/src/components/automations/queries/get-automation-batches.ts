import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment AutomationBatchDetail on AiAutomationBatch {
    id
    createdAt
    automationId
    status
    triggeredBy
    itemsTotal
    itemsProcessed
    itemsSuccess
    itemsWarning
    itemsFailed
    itemsSkipped
    startedAt
    finishedAt
  }
`)

interface GetAutomationBatchesParams {
  automationId: string
  skip?: number
  take?: number
}

const getAutomationBatches = createServerFn({ method: 'GET' })
  .inputValidator((data: GetAutomationBatchesParams) => data)
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getAutomationBatches($automationId: ID!, $skip: Int, $take: Int) {
          automationBatches(automationId: $automationId, skip: $skip, take: $take) {
            ...AutomationBatchDetail
          }
        }
      `),
      {
        automationId: ctx.data.automationId,
        skip: ctx.data.skip,
        take: ctx.data.take,
      },
    ),
  )

export const getAutomationBatchesQueryOptions = (params: GetAutomationBatchesParams) =>
  queryOptions({
    queryKey: [queryKeys.AutomationBatches, params],
    queryFn: () => getAutomationBatches({ data: params }),
  })
