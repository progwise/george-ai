import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { ActionType } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { logger } from './common'
import { getApiKeysQueryOptions } from './queries/get-api-keys'
import { getLibrariesQueryOptions } from './queries/get-libraries'
import { getLibraryQueryOptions } from './queries/get-library'
import { deleteLibraryFn } from './server-functions/delete-library'
import { generateApiKeyFn } from './server-functions/generate-api-key'
import { processFileFn } from './server-functions/processing'
import { revokeApiKeyFn } from './server-functions/revoke-api-key'
import { updateLibraryFn } from './server-functions/update-library'

export const useLibraryActions = (libraryId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
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
    mutationFn: (data: { libraryId: string; fileId: string; actionType: ActionType }) => processFileFn({ data }),
    onSuccess: (_data, { actionType }) => {
      logger.debug('processFileMutation success', { actionType })
      toastSuccess(`${actionType} successfully triggered`)
    },
    onError: (error, variables) => {
      logger.error('processFileMutation', { error, variables })
      toastError(`Failed to trigger processing: ${error.message}`)
    },
  })

  return {
    updateLibrary: updateLibraryMutation.mutate,
    deleteLibrary: deleteLibraryMutation.mutate,
    generateApiKey: generateApiKeyMutation.mutate,
    revokeApiKey: revokeApiKeyMutation.mutate,
    processFile: processFileMutation.mutate,
    isPending:
      updateLibraryMutation.isPending ||
      deleteLibraryMutation.isPending ||
      generateApiKeyMutation.isPending ||
      revokeApiKeyMutation.isPending ||
      processFileMutation.isPending,
  }
}
