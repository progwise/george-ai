import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { ProcessFilesInput } from '../../../gql/graphql'
import { ProcessFileInput } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { logger } from '../common'
import { deleteLibraryFileFn, deleteLibraryFilesFn, dropAllLibraryFilesFn } from '../server-functions/delete-files'
import { processFileFn, processFilesFn } from '../server-functions/processing'
import { cancelFileUploadFn, prepareDesktopFileUploadsFn } from './file-upload'
import { getFileChunksQueryOptions } from './get-file-chunks'
import { getFileInfoQueryOptions } from './get-file-info'
import { aiLibraryFilesQueryOptions } from './get-files'

export const useFileActions = ({ libraryId }: { libraryId: string }) => {
  const { t } = useTranslation()
  const { skip, take, showArchived } = useSearch({ strict: false })
  const queryClient = useQueryClient()
  const invalidateQueries = async (fileIds?: string[]) => {
    await Promise.all([
      ...(fileIds
        ? fileIds.map((fileId) =>
            queryClient.invalidateQueries({
              queryKey: getFileChunksQueryOptions({ libraryId, fileId }).queryKey,
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
        queryKey: aiLibraryFilesQueryOptions({
          libraryId,
          skip: skip || 0,
          take: take || 20,
          showArchived,
        }).queryKey,
      }),
    ])
  }
  const { mutate: processFilesMutate, isPending: processFilesMutateIsPending } = useMutation({
    mutationFn: (data: ProcessFilesInput) => processFilesFn({ data }),
    onError: (error, variables) => {
      logger.error('Error processing files', { error, variables })
      toastError(
        `Error starting  ${variables.fileIds.length} processings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
    onSuccess: (_data, variables) => {
      toastSuccess(`Successfully started ${variables.fileIds.length} file processings`)
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const { mutate: processFileMutate, isPending: processFileMutateIsPending } = useMutation({
    mutationFn: (data: ProcessFileInput) => processFileFn({ data }),
    onError: (error, variables) => {
      logger.error('Error processing file', { error, variables })
      toastError(
        `Error starting  ${variables.actionType} processing for file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    },
    onSuccess: (_data, variables) => {
      toastSuccess(`Successfully started ${variables.actionType} for file`)
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const { mutate: dropFileMutate, isPending: dropFilePending } = useMutation({
    mutationFn: (fileId: string) => deleteLibraryFileFn({ data: { libraryId, fileId } }),
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
    mutationFn: async (fileIds: string[]) => deleteLibraryFilesFn({ data: { libraryId, fileIds } }),
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
      prepareDesktopFileUploadsFn({ data: { libraryId, files } }),
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
    mutationFn: (fileId: string) => cancelFileUploadFn({ data: { libraryId, fileId } }),
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
    processFile: processFileMutate,
    processFiles: processFilesMutate,
    dropFile: dropFileMutate,
    dropFiles: dropFilesMutate,
    dropAllFiles: dropAllFilesMutate,
    prepareDesktopFileUploads: prepareDesktopFileUploadsMutate,
    cancelFileUpload: cancelFileUploadMutate,
    fileActionPending:
      processFileMutateIsPending ||
      processFilesMutateIsPending ||
      dropFilePending ||
      dropAllFilesIsPending ||
      dropFilesIsPending ||
      cancelFileUploadPending ||
      prepareDesktopFilesIsPending,
  }
}
