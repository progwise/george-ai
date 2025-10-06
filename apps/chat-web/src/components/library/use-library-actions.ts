import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { toastError, toastSuccess } from '../georgeToaster'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'
import { deleteLibraryFn } from './server-functions/delete-library'

const updateLibraryParticipants = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; userIds: string[] }) =>
    z
      .object({
        libraryId: z.string(),
        userIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation updateLibraryParticipants($libraryId: String!, $userIds: [String!]!) {
          updateLibraryParticipants(libraryId: $libraryId, userIds: $userIds) {
            totalParticipants
            addedParticipants
            removedParticipants
          }
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        userIds: ctx.data.userIds,
      },
    ),
  )

const removeLibraryParticipantFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; participantId: string }) =>
    z
      .object({
        libraryId: z.string(),
        participantId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation removeLibraryParticipant($libraryId: String!, $participantId: String!) {
          removeLibraryParticipant(libraryId: $libraryId, participantId: $participantId)
        }
      `),
      {
        libraryId: ctx.data.libraryId,
        participantId: ctx.data.participantId,
      },
    ),
  )

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
      return await updateLibraryParticipants({ data: { libraryId, userIds } })
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
    onSuccess: async () => {
      toastSuccess(t('libraries.deleteSuccess'))
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
