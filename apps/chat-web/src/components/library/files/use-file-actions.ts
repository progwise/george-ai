import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { dropOutdatedMarkdownFilesFn } from '../server-functions/delete-files'
import { createContentProcessingTasksFn, createEmbeddingTasksFn } from '../server-functions/processing'
import { getProcessingTasksQueryOptions } from '../tasks/get-tasks'
import { getFileChunksQueryOptions } from './get-file-chunks'
import { getFileInfoQueryOptions } from './get-file-info'

export const useFileActions = (params: { libraryId: string; fileId: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getFileChunksQueryOptions({ fileId: params.fileId }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: getFileInfoQueryOptions({ fileId: params.fileId }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: getProcessingTasksQueryOptions({ libraryId: params.libraryId, fileId: params.fileId }).queryKey,
      }),
    ])
  }
  const { mutate: createEmbeddingTasksMutate, isPending: createEmbeddingTasksIsPending } = useMutation({
    mutationFn: () => createEmbeddingTasksFn({ data: { fileIds: [params.fileId] } }),
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
  const { mutate: createExtractionTasksMutate, isPending: createExtractionsTasksIsPending } = useMutation({
    mutationFn: () => createContentProcessingTasksFn({ data: { fileIds: [params.fileId] } }),
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

  const { mutate: dropOutdatedMarkdownFilesMutate, isPending: createOutdatedMarkdownFilesPending } = useMutation({
    mutationFn: () => dropOutdatedMarkdownFilesFn({ data: { fileId: params.fileId } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.dropOutdatedMarkdownFiles', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.dropOutdatedMarkdownFilesSuccess', { count: data.dropOutdatedMarkdowns }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  return {
    createEmbeddingTasks: createEmbeddingTasksMutate,
    createExtractionTasks: createExtractionTasksMutate,
    dropOutdatedMarkdownFiles: dropOutdatedMarkdownFilesMutate,
    fileActionPending:
      createEmbeddingTasksIsPending || createExtractionsTasksIsPending || createOutdatedMarkdownFilesPending,
  }
}
