import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions } from './get-list'
import { getListsQueryOptions } from './get-lists'

export const updateListParticipants = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation updateListParticipants($listId: String!, $userIds: [String!]!) {
          updateListParticipants(listId: $listId, userIds: $userIds) {
            addedParticipants
            removedParticipants
            totalParticipants
          }
        }
      `),
      {
        listId: ctx.data.listId,
        userIds: ctx.data.userIds,
      },
    ),
  )

export const removeListParticipant = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        listId: z.string(),
        participantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation removeListParticipant($listId: String!, $participantId: String!) {
          removeListParticipant(listId: $listId, participantId: $participantId)
        }
      `),
      {
        listId: ctx.data.listId,
        participantId: ctx.data.participantId,
      },
    ),
  )

export const useListActions = (listId: string) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

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
    onSuccess: async (data) => {
      console.log('removeParticipant success', { data })
      toastSuccess(t('notifications.participantRemoved'))
      await queryClient.invalidateQueries(getListQueryOptions(listId))
      await queryClient.invalidateQueries(getListsQueryOptions())
    },
    onError: (error) => {
      toastError(t('errors.removeParticipantFailed', { error: error.message }))
    },
  })

  return { updateParticipants, removeParticipant, isPending: updateParticipantsIsPending || removeParticipantIsPending }
}
