import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getEventProcessingStatus = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const result = await backendRequest(
    graphql(`
      query GetProcessingStatus {
        processingStatus {
          status
          requestType
        }
      }
    `),
    ctx.data,
  )
  return result.processingStatus
})

export const getEventProcessingStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatus, {}],
    queryFn: () => getEventProcessingStatus(),
  })
