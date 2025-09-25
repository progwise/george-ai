import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions, getListsQueryOptions } from './queries'
import { deleteListFn, removeListParticipant, reorderListFields, updateListParticipants } from './server-functions'

export const useListActions = (listId: string) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate: deleteList, isPending: deleteListIsPending } = useMutation({
    mutationFn: () => deleteListFn({ data: listId }),
    onSuccess: async ({ deleteList }) => {
      toastSuccess(t('lists.deleteSuccess', { name: deleteList.name }))
    },
    onError: (error) => toastError(t('lists.deleteError', { message: error.message })),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getListsQueryOptions()),
        queryClient.removeQueries(getListQueryOptions(listId)),
      ])
      await navigate({ to: '/lists' })
    },
  })

  const { mutate: updateParticipants, isPending: updateParticipantsIsPending } = useMutation({
    mutationFn: async ({ userIds }: { userIds: string[] }) => {
      return await updateListParticipants({
        data: { listId, userIds },
      })
    },
    onSuccess: async (data) => {
      toastSuccess(t('lists.updateParticipantsSuccess', data.updateListParticipants))
    },
    onError: (error) => {
      toastError(t('errors.updateParticipantsFailed', { error: error.message }))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getListQueryOptions(listId))
      await queryClient.invalidateQueries(getListsQueryOptions())
    },
  })

  const { mutate: removeParticipant, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      return await removeListParticipant({ data: { participantId, listId } })
    },
    onSuccess: async () => {
      toastSuccess(t('lists.removeParticipantSuccess'))
    },
    onError: (error) => {
      toastError(t('errors.removeParticipantFailed', { error: error.message }))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getListQueryOptions(listId))
      await queryClient.invalidateQueries(getListsQueryOptions())
    },
  })

  const { mutate: reorderFields, isPending: reorderFieldsIsPending } = useMutation({
    mutationFn: async ({ fieldId, newPlace }: { fieldId: string; newPlace: number }) => {
      return await reorderListFields({ data: { fieldId, newPlace } })
    },
    onSuccess: async () => {
      toastSuccess(t('lists.fields.reorderSuccess'))
    },
    onError: (error) => {
      toastError(t('errors.reorderFieldFailed', { error: error.message }))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getListQueryOptions(listId))
      await queryClient.invalidateQueries(getListsQueryOptions())
    },
  })

  return {
    deleteList,
    updateParticipants,
    removeParticipant,
    reorderFields,
    isPending:
      updateParticipantsIsPending || removeParticipantIsPending || deleteListIsPending || reorderFieldsIsPending,
  }
}
