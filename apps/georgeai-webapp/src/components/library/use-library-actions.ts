import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getApiKeysQueryOptions } from './queries/get-api-keys'
import { getLibrariesQueryOptions } from './queries/get-libraries'
import { getLibraryQueryOptions } from './queries/get-library'
import { deleteLibraryFn } from './server-functions/delete-library'
import { generateApiKeyFn } from './server-functions/generate-api-key'
import { removeLibraryParticipantFn, updateLibraryParticipantsFn } from './server-functions/participants'
import { revokeApiKeyFn } from './server-functions/revoke-api-key'
import { updateLibraryFn } from './server-functions/update-library'

export const useLibraryActions = (libraryId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateLibraryMutation = useMutation({
    mutationFn: (data: FormData) => updateLibraryFn({ data }),
    onError: (error) => {
      toastError(t('libraries.saveError', { error: error.message }))
    },
    onSuccess: async (data) => {
      toastSuccess(t('libraries.saveSuccess', { name: data.updateLibrary.name }))
      await Promise.all([
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
        queryClient.invalidateQueries(getLibraryQueryOptions(libraryId)),
      ])
    },
  })

  const removeParticipantsMutation = useMutation({
    mutationFn: (data: { participantId: string }) => removeLibraryParticipantFn({ data: { libraryId, ...data } }),
    onError: (error) => {
      toastError(t('errors.removeParticipantFailed', { error: error.message }))
    },
    onSuccess: async () => {
      toastSuccess(t('libraries.removeParticipantSuccess'))
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getLibraryQueryOptions(libraryId)),
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
      ])
    },
  })

  const updateParticipantsMutation = useMutation({
    mutationFn: async ({ userIds }: { userIds: string[] }) => {
      return await updateLibraryParticipantsFn({ data: { libraryId, userIds } })
    },
    onError: (error) => {
      toastError(t('errors.updateParticipantsFailed', { error: error.message }))
    },
    onSuccess: async (data) => {
      toastSuccess(t('libraries.updateParticipantsSuccess', data.updateLibraryParticipants))
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getLibraryQueryOptions(libraryId)),
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
      ])
    },
  })

  const deleteLibraryMutation = useMutation({
    mutationFn: () => deleteLibraryFn({ data: libraryId }),
    onSuccess: async (response) => {
      toastSuccess(t('libraries.deleteSuccess', { name: response.deleteLibrary.name }))
    },
    onError: (error) => {
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
    onSuccess: () => {
      toastSuccess(t('apiKeys.generateSuccess'))
      queryClient.invalidateQueries(getApiKeysQueryOptions(libraryId))
    },
    onError: (error) => {
      toastError(t('toasts.error', { error: error.message }))
    },
  })

  const revokeApiKeyMutation = useMutation({
    mutationFn: (id: string) => revokeApiKeyFn({ data: { id } }),
    onSuccess: () => {
      toastSuccess(t('apiKeys.revokeSuccess'))
      queryClient.invalidateQueries(getApiKeysQueryOptions(libraryId))
    },
    onError: (error) => {
      toastError(t('toasts.error', { error: error.message }))
    },
  })

  return {
    updateLibrary: updateLibraryMutation.mutate,
    deleteLibrary: deleteLibraryMutation.mutate,
    updateParticipants: updateParticipantsMutation.mutate,
    removeParticipant: removeParticipantsMutation.mutate,
    generateApiKey: generateApiKeyMutation.mutate,
    revokeApiKey: revokeApiKeyMutation.mutate,
    isPending:
      updateLibraryMutation.isPending ||
      updateParticipantsMutation.isPending ||
      removeParticipantsMutation.isPending ||
      deleteLibraryMutation.isPending ||
      generateApiKeyMutation.isPending ||
      revokeApiKeyMutation.isPending,
  }
}
