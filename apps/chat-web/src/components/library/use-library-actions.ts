import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getLibrariesQueryOptions } from './queries/get-libraries'
import { getLibraryQueryOptions } from './queries/get-library'
import { deleteLibraryFn } from './server-functions/delete-library'
import { removeLibraryParticipantFn, updateLibraryParticipantsFn } from './server-functions/participants'

export const useLibraryActions = (libraryId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: removeParticipant, isPending: removeLibraryParticipantIsPending } = useMutation({
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

  const { mutate: updateParticipants, isPending: isUpdatingParticipants } = useMutation({
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

  const { mutate: deleteLibrary, isPending: deleteLibraryIsPending } = useMutation({
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

  return {
    deleteLibrary,
    updateParticipants: (data: { userIds: string[] }) => updateParticipants(data),
    removeParticipant: (data: { participantId: string }) => removeParticipant(data),
    isPending: isUpdatingParticipants || removeLibraryParticipantIsPending || deleteLibraryIsPending,
  }
}
