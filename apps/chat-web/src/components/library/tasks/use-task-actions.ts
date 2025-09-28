import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'
import { toastError, toastSuccess } from '../../georgeToaster'
import { getProcessingTasksQueryOptions } from './get-tasks'

export const cancelProcessingTask = createServerFn({ method: 'POST' })
  .inputValidator((data: { taskId: string; fileId: string }) => {
    const parsedData = z
      .object({
        taskId: z.string().nonempty(),
        fileId: z.string().nonempty(),
      })
      .parse(data)
    return parsedData
  })
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation cancelProcessingTask($taskId: String!, $fileId: String!) {
          cancelProcessingTask(taskId: $taskId, fileId: $fileId) {
            id
          }
        }
      `),
      ctx.data,
    )
  })

interface UseTaskActionsProps {
  libraryId: string
  fileId?: string
}

export const useTaskActions = ({ libraryId, fileId }: UseTaskActionsProps) => {
  const queryClient = useQueryClient()
  const cancelProcessingTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; fileId: string }) => cancelProcessingTask({ data }),
    onSuccess: () => {
      toastSuccess('Task cancelled successfully')
    },
    onError: (error) => {
      console.error('Failed to cancel task:', error)
      toastError(`Failed to cancel task: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries(getProcessingTasksQueryOptions({ libraryId, fileId }))
    },
  })

  return {
    cancelProcessingTask: cancelProcessingTaskMutation.mutate,
    isPending: cancelProcessingTaskMutation.isPending,
  }
}
