import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { EventQueueAction } from '../../../gql/graphql'
import { startProcessingFn } from '../server-functions/start-processing'
import { stopProcessingFn } from '../server-functions/stop-processing'

export const useWorkerActions = () => {
  const startProcessingMutation = useMutation({
    mutationFn: (action: EventQueueAction) => startProcessingFn({ data: { action } }),
    onSuccess: (_data, variables) => {
      toast.success(`Started processing: ${variables}`)
    },
    onError: (error) => {
      toast.error(`Failed to start processing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const stopProcessingMutation = useMutation({
    mutationFn: (action: EventQueueAction) => stopProcessingFn({ data: { action } }),
    onSuccess: (_data, variables) => {
      toast.success(`Stopped processing: ${variables}`)
    },
    onError: (error) => {
      toast.error(`Failed to stop processing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  return {
    startProcessing: startProcessingMutation.mutate,
    stopProcessing: stopProcessingMutation.mutate,
    pending: startProcessingMutation.isPending || stopProcessingMutation.isPending,
  }
}
