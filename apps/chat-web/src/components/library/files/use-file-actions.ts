import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import {
  deleteLibraryFileFn,
  deleteLibraryFilesFn,
  dropAllLibraryFilesFn,
  dropOutdatedMarkdownFilesFn,
} from '../server-functions/delete-files'
import { createContentProcessingTasksFn, createEmbeddingTasksFn } from '../server-functions/processing'
import { getProcessingTasksQueryOptions } from '../tasks/get-tasks'
import { cancelFileUploadFn, prepareDesktopFileUploadsFn } from './file-upload'
import { getFileChunksQueryOptions } from './get-file-chunks'
import { getFileInfoQueryOptions } from './get-file-info'
import { aiLibraryFilesQueryOptions } from './get-files'

export const useFileActions = (params: { libraryId: string }) => {
  const { t } = useTranslation()
  const { skip, take, showArchived } = useSearch({ strict: false })
  const queryClient = useQueryClient()
  const invalidateQueries = async (fileIds?: string[]) => {
    await Promise.all([
      ...(fileIds
        ? fileIds.map((fileId) =>
            queryClient.invalidateQueries({
              queryKey: getFileChunksQueryOptions({ fileId }).queryKey,
            }),
          )
        : []),
      ...(fileIds
        ? fileIds.map((fileId) =>
            queryClient.invalidateQueries({
              queryKey: getFileInfoQueryOptions({ fileId }).queryKey,
            }),
          )
        : []),
      queryClient.invalidateQueries({
        queryKey: getProcessingTasksQueryOptions({ libraryId: params.libraryId }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: aiLibraryFilesQueryOptions({
          libraryId: params.libraryId,
          skip: skip || 0,
          take: take || 20,
          showArchived,
        }).queryKey,
      }),
    ])
  }
  const { mutate: createEmbeddingTasksMutate, isPending: createEmbeddingTasksIsPending } = useMutation({
    mutationFn: (fileIds: string[]) => createEmbeddingTasksFn({ data: { fileIds: fileIds } }),
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
    mutationFn: (fileIds: string[]) => createContentProcessingTasksFn({ data: { fileIds } }),
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
    mutationFn: (fileId: string) => dropOutdatedMarkdownFilesFn({ data: { fileId } }),
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

  const { mutate: dropFileMutate, isPending: dropFilePending } = useMutation({
    mutationFn: (fileId: string) => deleteLibraryFileFn({ data: { fileId } }),
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? `${error.message}: ${error.cause}` : ''
      toastError(t('errors.dropFile', { error: errorMessage }))
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: 1 }) + `: ${data.name}`)
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const { mutate: dropFilesMutate, isPending: dropFilesIsPending } = useMutation({
    mutationFn: async (fileIds: string[]) => deleteLibraryFilesFn({ data: { fileIds } }),
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: data.deleteLibraryFiles }))
    },
    onError: (error) => {
      toastError(t('errors.dropFilesError', { error: error instanceof Error ? error.message : '' }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const { mutate: dropAllFilesMutate, isPending: dropAllFilesIsPending } = useMutation({
    mutationFn: async (libraryId: string) => dropAllLibraryFilesFn({ data: { libraryId } }),
    onError: () => {
      toastError(t('errors.dropAllFilesError'))
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: data.dropAllLibraryFiles }))
    },
    onSettled: () => {},
  })

  const { mutate: prepareDesktopFileUploadsMutate, isPending: prepareDesktopFilesIsPending } = useMutation({
    mutationFn: (files: { name: string; type: string; size: number; lastModified: Date }[]) =>
      prepareDesktopFileUploadsFn({ data: { libraryId: params.libraryId, files } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.prepareFileUploads', { error: 'Unknown error' })
      toastError(errorMessage)
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const { mutate: cancelFileUploadMutate, isPending: cancelFileUploadPending } = useMutation({
    mutationFn: (fileId: string) => cancelFileUploadFn({ data: { fileId } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.cancelFileUpload', { error: 'Unknown error' })
      toastError(errorMessage)
    },
    onSuccess: () => {
      toastSuccess(t('actions.cancelFileUploadSuccess'))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  return {
    createEmbeddingTasks: createEmbeddingTasksMutate,
    createExtractionTasks: createExtractionTasksMutate,
    dropOutdatedMarkdownFiles: dropOutdatedMarkdownFilesMutate,
    dropFile: dropFileMutate,
    dropFiles: dropFilesMutate,
    dropAllFiles: dropAllFilesMutate,
    prepareDesktopFileUploads: prepareDesktopFileUploadsMutate,
    cancelFileUpload: cancelFileUploadMutate,
    fileActionPending:
      createEmbeddingTasksIsPending ||
      createExtractionsTasksIsPending ||
      createOutdatedMarkdownFilesPending ||
      dropFilePending ||
      dropAllFilesIsPending ||
      dropFilesIsPending ||
      cancelFileUploadPending ||
      prepareDesktopFilesIsPending,
  }
}
