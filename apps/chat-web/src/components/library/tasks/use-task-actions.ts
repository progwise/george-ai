import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toastError, toastSuccess } from '../../georgeToaster'
import { aiLibraryFilesQueryOptions } from '../files/get-files'
import {
  cancelProcessingTaskFn,
  createMissingContentExtractionTasksFn,
  dropPendingTasksFn,
} from '../server-functions/processing'
import { getProcessingTasksQueryOptions } from './get-tasks'

interface UseTaskActionsProps {
  libraryId: string
}

export const useTaskActions = ({ libraryId }: UseTaskActionsProps) => {
  const queryClient = useQueryClient()
  const cancelProcessingTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; fileId: string }) => cancelProcessingTaskFn({ data }),
    onSuccess: (data) => {
      toastSuccess('Task cancelled successfully')
      queryClient.invalidateQueries(
        getProcessingTasksQueryOptions({ libraryId, fileId: data.cancelProcessingTask.fileId }),
      )
    },
    onError: (error) => {
      console.error('Failed to cancel task:', error)
      toastError(`Failed to cancel task: ${error.message}`)
    },
    onSettled: () => {},
  })

  const createMissingContentExtractionTasksMutation = useMutation({
    mutationFn: () => createMissingContentExtractionTasksFn({ data: { libraryId } }),
    onSuccess: () => {
      toastSuccess('Processing unprocessed files started')
      queryClient.invalidateQueries(getProcessingTasksQueryOptions({ libraryId }))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions({ libraryId, skip: 0, take: 1 }))
    },
    onError: (error) => {
      console.error('Failed to start processing unprocessed files:', error)
      toastError(`Failed to start processing unprocessed files: ${error.message}`)
    },
    onSettled: () => {},
  })

  const dropPendingTasksMutation = useMutation({
    mutationFn: () => dropPendingTasksFn({ data: { libraryId } }), // Placeholder, implement if needed
    onSuccess: () => {
      toastSuccess('Pending tasks dropped successfully')
      queryClient.invalidateQueries(getProcessingTasksQueryOptions({ libraryId }))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions({ libraryId, skip: 0, take: 1 }))
    },
    onError: (error) => {
      console.error('Failed to drop pending tasks:', error)
      toastError(`Failed to drop pending tasks: ${error.message}`)
    },
    onSettled: () => {},
  })

  return {
    cancelProcessingTask: cancelProcessingTaskMutation.mutate,
    createMissingContentExtractionTasks: createMissingContentExtractionTasksMutation.mutate,
    dropPendingTasks: dropPendingTasksMutation.mutate,
    isPending:
      cancelProcessingTaskMutation.isPending ||
      createMissingContentExtractionTasksMutation.isPending ||
      dropPendingTasksMutation.isPending,
  }
}
