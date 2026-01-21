import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const eventProcessingStatusDocument = graphql(`
  query GetEventProcessingStatus {
    eventProcessingStatus {
      status
      processType
    }
  }
`)

const getEventProcessingStatus = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { eventProcessingStatus } = await backendRequest(eventProcessingStatusDocument, ctx.data)
  return eventProcessingStatus
})

export const getEventProcessingStatusQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.EventProcessingStatus, {}],
    queryFn: () => getEventProcessingStatus(),
  })
