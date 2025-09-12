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
  .validator((data: { queueType: QueueType }) => data)
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
  .validator((data: { queueType: QueueType }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(stopQueueWorkerQuery, { queueType: data.queueType })
    return response.stopQueueWorker
  })

// Retry failed tasks
const retryFailedTasksQuery = graphql(`
  mutation RetryFailedTasks($queueType: QueueType!, $libraryId: String) {
    retryFailedTasks(queueType: $queueType, libraryId: $libraryId) {
      success
      message
      affectedCount
    }
  }
`)

export const retryFailedTasks = createServerFn({ method: 'POST' })
  .validator((data: { queueType: QueueType; libraryId?: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(retryFailedTasksQuery, {
      queueType: data.queueType,
      libraryId: data.libraryId || null,
    })
    return response.retryFailedTasks
  })

// Clear failed tasks
const clearFailedTasksQuery = graphql(`
  mutation ClearFailedTasks($queueType: QueueType!, $libraryId: String) {
    clearFailedTasks(queueType: $queueType, libraryId: $libraryId) {
      success
      message
      affectedCount
    }
  }
`)

export const clearFailedTasks = createServerFn({ method: 'POST' })
  .validator((data: { queueType: 'ENRICHMENT' | 'CONTENT_PROCESSING'; libraryId?: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(clearFailedTasksQuery, {
      queueType: data.queueType,
      libraryId: data.libraryId || null,
    })
    return response.clearFailedTasks
  })

export const clearPendingTasks = createServerFn({ method: 'POST' })
  .validator((data: { queueType: 'ENRICHMENT' | 'CONTENT_PROCESSING'; libraryId?: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(
      graphql(`
        mutation ClearTasks($queueType: QueueType!, $libraryId: String) {
          clearPendingTasks(queueType: $queueType, libraryId: $libraryId) {
            success
            message
            affectedCount
          }
        }
      `),
      {
        queueType: data.queueType,
        libraryId: data.libraryId || null,
      },
    )
    return response.clearPendingTasks
  })

// Cancel content processing tasks
const cancelContentProcessingTasksQuery = graphql(`
  mutation CancelContentProcessingTasks($libraryId: String) {
    cancelContentProcessingTasks(libraryId: $libraryId) {
      success
      message
      affectedCount
    }
  }
`)

export const cancelContentProcessingTasks = createServerFn({ method: 'POST' })
  .validator((data: { libraryId?: string }) => data)
  .handler(async ({ data }) => {
    const response = await backendRequest(cancelContentProcessingTasksQuery, {
      libraryId: data.libraryId || null,
    })
    return response.cancelContentProcessingTasks
  })
