import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const queueStatusQuery = graphql(`
  query GetQueueSystemStatus {
    queueSystemStatus {
      ...QueueSystemStatus_ManagementPanel
    }
  }
`)

export const getQueueSystemStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const response = await backendRequest(queueStatusQuery, {})
  return response.queueSystemStatus
})

export const getQueueStatusQueryOptions = () =>
  queryOptions({
    queryKey: ['queueSystemStatus'],
    queryFn: () => getQueueSystemStatus(),
  })
