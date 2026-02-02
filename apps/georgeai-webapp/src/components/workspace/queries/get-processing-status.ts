import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getEventProcessingStatus = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { eventProcessingStatus } = await backendRequest(
    graphql(`
      query GetEventProcessingStatus {
        eventProcessingStatus {
          status
          actionType
        }
      }
    `),
    ctx.data,
  )
  return eventProcessingStatus
})

export const getEventProcessingStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatus, {}],
    queryFn: () => getEventProcessingStatus(),
  })
