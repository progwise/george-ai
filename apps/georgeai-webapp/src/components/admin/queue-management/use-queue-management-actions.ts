import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QueueType } from '../../../gql/graphql'
import { toastError, toastSuccess } from '../../georgeToaster'
import { getQueueStatusQueryOptions } from './get-queue-status'
import {
  cancelContentProcessingTasks,
  clearFailedTasks,
  clearPendingTasks,
  retryFailedTasks,
  startQueueWorker,
  stopQueueWorker,
} from './queue-management-actions'

export const useQueueManagementActions = () => {
  const queryClient = useQueryClient()

  // Mutation for starting individual worker
  const startWorkerMutation = useMutation({
    mutationFn: (data: { queueType: QueueType }) => startQueueWorker({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(result.message)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to start worker: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  // Mutation for stopping individual worker
  const stopWorkerMutation = useMutation({
    mutationFn: (data: { queueType: QueueType }) => stopQueueWorker({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(result.message)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to stop worker: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  // Mutation for retrying failed tasks
  const retryFailedMutation = useMutation({
    mutationFn: (data: { queueType: QueueType; libraryId?: string }) => retryFailedTasks({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(`${result.message} (${result.affectedCount} tasks)`)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to retry tasks: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  // Mutation for clearing failed tasks
  const clearFailedMutation = useMutation({
    mutationFn: (data: { queueType: QueueType; libraryId?: string }) => clearFailedTasks({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(`${result.message} (${result.affectedCount} tasks)`)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to clear failed tasks: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  // Mutation for clearing pending tasks
  const clearPendingMutation = useMutation({
    mutationFn: (data: { queueType: QueueType; libraryId?: string }) => clearPendingTasks({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(`${result.message} (${result.affectedCount} tasks)`)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to clear tasks: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  // Mutation for cancelling content processing tasks
  const cancelContentProcessingMutation = useMutation({
    mutationFn: (data: { libraryId?: string }) => cancelContentProcessingTasks({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(`${result.message} (${result.affectedCount} tasks)`)
        queryClient.invalidateQueries(getQueueStatusQueryOptions())
      } else {
        toastError(result.message)
      }
    },
    onError: (error) => {
      toastError(`Failed to cancel processing tasks: ${error.message}`)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getQueueStatusQueryOptions())
    },
  })

  return {
    startWorker: startWorkerMutation.mutate,
    stopWorker: stopWorkerMutation.mutate,
    retryFailedTasks: retryFailedMutation.mutate,
    clearFailedTasks: clearFailedMutation.mutate,
    clearPendingTasks: clearPendingMutation.mutate,
    cancelContentProcessingTasks: cancelContentProcessingMutation.mutate,
    actionsPending:
      startWorkerMutation.isPending ||
      stopWorkerMutation.isPending ||
      retryFailedMutation.isPending ||
      clearFailedMutation.isPending ||
      clearPendingMutation.isPending ||
      cancelContentProcessingMutation.isPending,
  }
}
