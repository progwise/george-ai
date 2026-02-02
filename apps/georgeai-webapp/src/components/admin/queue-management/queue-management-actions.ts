import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { QueueType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

// Start specific worker
const startQueueWorkerQuery = graphql(`
  mutation StartQueueWorker($queueType: QueueType!) {
    startQueueWorker(queueType: $queueType) {
      success
      message
    }
  }
`)

export const startQueueWorker = createServerFn({ method: 'POST' })
  .inputValidator((data: { queueType: QueueType }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(startQueueWorkerQuery, { queueType: data.queueType })
    return response.startQueueWorker
  })

// Stop specific worker
const stopQueueWorkerQuery = graphql(`
  mutation StopQueueWorker($queueType: QueueType!) {
    stopQueueWorker(queueType: $queueType) {
      success
      message
    }
  }
`)

export const stopQueueWorker = createServerFn({ method: 'POST' })
  .inputValidator((data: { queueType: QueueType }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(stopQueueWorkerQuery, { queueType: data.queueType })
    return response.stopQueueWorker
  })
