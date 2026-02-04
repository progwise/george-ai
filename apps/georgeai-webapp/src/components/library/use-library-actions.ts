import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { ProcessFileInput, ProcessFilesInput } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { logger } from './common'
import {
  getApiKeysQueryOptions,
  getFileChunksQueryOptions,
  getFileInfoQueryOptions,
  getFilesQueryOptions,
  getLibrariesQueryOptions,
  getLibraryQueryOptions,
} from './queries'
import {
  cancelFileUploadFn,
  deleteLibraryFileFn,
  deleteLibraryFilesFn,
  deleteLibraryFn,
  dropAllLibraryFilesFn,
  generateApiKeyFn,
  prepareDesktopFileUploadsFn,
  processFileFn,
  processFilesFn,
  revokeApiKeyFn,
  updateLibraryFn,
} from './server-functions'

export const useLibraryActions = (libraryId: string) => {
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
        queryKey: getFilesQueryOptions({
          libraryId,
          skip: skip || 0,
          take: take || 20,
          showArchived,
        }).queryKey,
      }),
    ])
  }
  const navigate = useNavigate()

  const updateLibraryMutation = useMutation({
    mutationFn: (data: FormData) => updateLibraryFn({ data }),
    onError: (error, variables) => {
      logger.error('updateLibraryMutation', { error, variables })
      toastError(t('libraries.saveError', { error: error.message }))
    },
    onSuccess: async (data, variables) => {
      logger.debug('updateLibraryMutation success', { data, variables })
      toastSuccess(t('libraries.saveSuccess', { name: data.updateLibrary.name }))
      await Promise.all([
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
        queryClient.invalidateQueries(getLibraryQueryOptions(libraryId)),
      ])
    },
  })

  const deleteLibraryMutation = useMutation({
    mutationFn: () => deleteLibraryFn({ data: libraryId }),
    onSuccess: async (response, variables) => {
      logger.debug('deleteLibraryMutation success', { response, variables })
      toastSuccess(t('libraries.deleteSuccess', { name: response.deleteLibrary.name }))
    },
    onError: (error, variables) => {
      logger.error('deleteLibraryMutation', { error, variables })
      toastError(t('libraries.deleteError', { message: error.message }))
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
        queryClient.removeQueries(getLibraryQueryOptions(libraryId)),
      ])
      navigate({ to: '/libraries' })
    },
  })

  const generateApiKeyMutation = useMutation({
    mutationFn: (name: string) => generateApiKeyFn({ data: { libraryId, name } }),
    onSuccess: (data, variables) => {
      logger.debug('generateApiKeyMutation success', { data, variables })
      toastSuccess(t('apiKeys.generateSuccess'))
      queryClient.invalidateQueries(getApiKeysQueryOptions(libraryId))
    },
    onError: (error, variables) => {
      logger.error('generateApiKeyMutation', { error, variables })
      toastError(t('toasts.error', { error: error.message }))
    },
  })

  const revokeApiKeyMutation = useMutation({
    mutationFn: (id: string) => revokeApiKeyFn({ data: { id } }),
    onSuccess: (data, variables) => {
      logger.debug('revokeApiKeyMutation success', { data, variables })
      toastSuccess(t('apiKeys.revokeSuccess'))
      queryClient.invalidateQueries(getApiKeysQueryOptions(libraryId))
    },
    onError: (error, variables) => {
      logger.error('revokeApiKeyMutation', { error, variables })
      toastError(t('toasts.error', { error: error.message }))
    },
  })

  const processFileMutation = useMutation({
    mutationFn: (data: ProcessFileInput) => processFileFn({ data }),
    onSuccess: (_data, { actionType }) => {
      logger.debug('processFileMutation success', { actionType })
      toastSuccess(`${actionType} successfully triggered`)
    },
    onError: (error, variables) => {
      logger.error('processFileMutation', { error, variables })
      toastError(`Failed to trigger processing: ${error.message}`)
    },
  })

  const processFilesMutation = useMutation({
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

  const deleteFileMutation = useMutation({
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

  const deleteFilesMutation = useMutation({
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

  const dropFilesMutation = useMutation({
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
    updateLibrary: updateLibraryMutation.mutate,
    deleteLibrary: deleteLibraryMutation.mutate,
    generateApiKey: generateApiKeyMutation.mutate,
    revokeApiKey: revokeApiKeyMutation.mutate,
    processFile: processFileMutation.mutate,
    processFiles: processFilesMutation.mutate,
    deleteFile: deleteFileMutation.mutate,
    deleteFiles: deleteFilesMutation.mutate,
    dropAllFiles: dropFilesMutation.mutate,
    prepareDesktopFileUploads: prepareDesktopFileUploadsMutate,
    cancelFileUpload: cancelFileUploadMutate,
    isPending:
      updateLibraryMutation.isPending ||
      deleteLibraryMutation.isPending ||
      generateApiKeyMutation.isPending ||
      revokeApiKeyMutation.isPending ||
      processFileMutation.isPending ||
      processFilesMutation.isPending ||
      deleteFileMutation.isPending ||
      deleteFilesMutation.isPending ||
      dropFilesMutation.isPending ||
      cancelFileUploadPending ||
      prepareDesktopFilesIsPending,
  }
}
