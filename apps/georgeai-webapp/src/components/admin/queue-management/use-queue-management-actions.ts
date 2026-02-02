import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QueueType } from '../../../gql/graphql'
import { toastError, toastSuccess } from '../../georgeToaster'
import { getQueueStatusQueryOptions } from './get-queue-status'
import { startQueueWorker, stopQueueWorker } from './queue-management-actions'

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

  return {
    startWorker: startWorkerMutation.mutate,
    stopWorker: stopWorkerMutation.mutate,
    actionsPending: startWorkerMutation.isPending || stopWorkerMutation.isPending,
  }
}
