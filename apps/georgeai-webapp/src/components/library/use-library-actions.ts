import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { ExtractionMethod } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { logger } from './common'
import {
  getDocumentChunksQueryOptions,
  getDocumentsQueryOptions,
  getLibrariesQueryOptions,
  getLibraryQueryOptions,
} from './queries'
import {
  cancelFileUploadFn,
  deleteDocumentFn,
  deleteDocumentsFn,
  deleteLibraryFn,
  dropAllLibraryDocumentsFn,
  prepareDesktopFileUploadsFn,
  triggerExtractionFn,
  triggerVectorizationFn,
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
              queryKey: getDocumentChunksQueryOptions({ libraryId, documentId: fileId }).queryKey,
            }),
          )
        : []),
      queryClient.invalidateQueries({
        queryKey: getDocumentsQueryOptions({
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
      toastSuccess(t('libraries.deleteSuccess'))
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

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocumentFn({ data: { libraryId, documentId } }),
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? `${error.message}: ${error.cause}` : ''
      toastError(t('errors.dropDocument', { error: errorMessage }))
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: 1 }) + `: ${data.name}`)
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const deleteDocumentsMutation = useMutation({
    mutationFn: async (documentIds: string[]) => deleteDocumentsFn({ data: { libraryId, documentIds } }),
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: data.deleteDocuments }))
    },
    onError: (error) => {
      toastError(t('errors.dropDocumentsError', { error: error instanceof Error ? error.message : '' }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const dropDocumentsMutation = useMutation({
    mutationFn: async (libraryId: string) => dropAllLibraryDocumentsFn({ data: { libraryId } }),
    onError: () => {
      toastError(t('errors.dropAllDocumentsError'))
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.dropSuccess', { count: data.clearFiles }))
    },
    onSettled: () => {},
  })

  const { mutate: prepareDesktopFileUploadsMutate, isPending: prepareDesktopFilesIsPending } = useMutation({
    mutationFn: (
      files: { name: string; mimeType: string; size: number; modificationDate: Date; originUri: string }[],
    ) => prepareDesktopFileUploadsFn({ data: { libraryId, files } }),
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

  const triggerExtractionMutation = useMutation({
    mutationFn: (options: { documentId: string; extractionMethod?: ExtractionMethod }) =>
      triggerExtractionFn({ data: { libraryId, ...options } }),
  })

  const triggerVectorizationMutation = useMutation({
    mutationFn: (options: { documentId: string; extractionMethod?: ExtractionMethod }) =>
      triggerVectorizationFn({ data: { libraryId, ...options } }),
  })

  return {
    updateLibrary: updateLibraryMutation.mutate,
    deleteLibrary: deleteLibraryMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
    deleteDocuments: deleteDocumentsMutation.mutate,
    dropAllDocuments: dropDocumentsMutation.mutate,
    triggerExtraction: triggerExtractionMutation.mutate,
    triggerVectorization: triggerVectorizationMutation.mutate,
    prepareDesktopFileUploads: prepareDesktopFileUploadsMutate,
    cancelFileUpload: cancelFileUploadMutate,
    isPending:
      updateLibraryMutation.isPending ||
      deleteLibraryMutation.isPending ||
      deleteDocumentMutation.isPending ||
      deleteDocumentsMutation.isPending ||
      dropDocumentsMutation.isPending ||
      cancelFileUploadPending ||
      prepareDesktopFilesIsPending ||
      triggerExtractionMutation.isPending ||
      triggerVectorizationMutation.isPending,
  }
}
