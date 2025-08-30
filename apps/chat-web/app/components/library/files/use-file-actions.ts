import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { createEmbeddingTasks, createExtractionTasks } from './change-files'
import { getFileChunksQueryOptions } from './get-file-chunks'
import { getFileInfoQueryOptions } from './get-file-info'

export const useFileActions = (params: { fileId: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const invalidateQueries = async () => {
    queryClient.invalidateQueries({
      queryKey: getFileChunksQueryOptions({ fileId: params.fileId }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: getFileInfoQueryOptions({ fileId: params.fileId }).queryKey,
    })
  }
  const { mutate: createEmbeddingTasksMutation, isPending: createEmbeddingTasksIsPending } = useMutation({
    mutationFn: () => createEmbeddingTasks({ data: { fileIds: [params.fileId] } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.createEmbeddingTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createEmbeddingTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })
  const { mutate: createExtractionTasksMutation, isPending: createExtractionsTasksIsPending } = useMutation({
    mutationFn: () => createExtractionTasks({ data: { fileIds: [params.fileId] } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.createExtractionTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createExtractionTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  return {
    createEmbeddingTasksMutation,
    createExtractionTasksMutation,
    createTasksMutationPending: createEmbeddingTasksIsPending || createExtractionsTasksIsPending,
  }
}
