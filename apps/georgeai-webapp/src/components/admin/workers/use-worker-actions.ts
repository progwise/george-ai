import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { getWorkspaceWorkersQueryOptions } from '../queries/get-workers'
import { startProcessingFn } from '../server-functions/start-processing'
import { stopProcessingFn } from '../server-functions/stop-processing'

export const useWorkerActions = () => {
  // Use suspense query - data is guaranteed to be available
  const { data: workers } = useSuspenseQuery({
    ...getWorkspaceWorkersQueryOptions(),
    refetchInterval: 5000, // Override refetch interval for auto-refresh
  })

  const startProcessingMutation = useMutation({
    mutationFn: startProcessingFn,
    onSuccess: (_data, variables) => {
      toast.success(`Started processing: ${variables.data.processingType}`)
    },
    onError: (error) => {
      toast.error(`Failed to start processing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const stopProcessingMutation = useMutation({
    mutationFn: stopProcessingFn,
    onSuccess: (_data, variables) => {
      toast.success(`Stopped processing: ${variables.data.processingType}`)
    },
    onError: (error) => {
      toast.error(`Failed to stop processing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  return {
    workers,
    isProcessing: (processingType: string) =>
      workers.some(
        (worker) => worker.healthy && worker.activeSubscriptions.some((sub) => sub.processingType === processingType),
      ),
    startProcessing: startProcessingMutation.mutate,
    stopProcessing: stopProcessingMutation.mutate,
    pending: startProcessingMutation.isPending || stopProcessingMutation.isPending,
  }
}
