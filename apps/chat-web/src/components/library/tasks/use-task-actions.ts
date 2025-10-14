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
  })

  const createMissingContentExtractionTasksMutation = useMutation({
    mutationFn: () => createMissingContentExtractionTasksFn({ data: { libraryId } }),
    onSuccess: (data) => {
      const taskCount = data.createMissingContentExtractionTasks.length
      toastSuccess(`Successfully created ${taskCount} extraction task${taskCount === 1 ? '' : 's'}`)
      queryClient.invalidateQueries(getProcessingTasksQueryOptions({ libraryId }))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions({ libraryId, skip: 0, take: 1 }))
    },
    onError: (error) => {
      console.error('Failed to start processing unprocessed files:', error)
      toastError(`Failed to start processing unprocessed files: ${error.message}`)
    },
  })

  const dropPendingTasksMutation = useMutation({
    mutationFn: () => dropPendingTasksFn({ data: { libraryId } }),
    onSuccess: (data) => {
      const droppedCount = data.dropPendingTasks
      toastSuccess(`Successfully dropped ${droppedCount} pending task${droppedCount === 1 ? '' : 's'}`)
      queryClient.invalidateQueries(getProcessingTasksQueryOptions({ libraryId }))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions({ libraryId, skip: 0, take: 1 }))
    },
    onError: (error) => {
      console.error('Failed to drop pending tasks:', error)
      toastError(`Failed to drop pending tasks: ${error.message}`)
    },
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
