import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addConversationParticipants, removeConversationParticipant } from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'
import {
  ParticipantsDialog,
  ParticipantsDialog_AssistantsFragment,
  ParticipantsDialog_ConversationFragment,
  ParticipantsDialog_HumansFragment,
} from './participants-dialog'

interface ConversationParticipantsProps {
  conversation: FragmentType<typeof ParticipantsDialog_ConversationFragment>
  assistants: FragmentType<typeof ParticipantsDialog_AssistantsFragment>[] | null
  humans: FragmentType<typeof ParticipantsDialog_HumansFragment>[] | null
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const authContext = useAuth()
  const user = authContext.user

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const conversation = useFragment(ParticipantsDialog_ConversationFragment, props.conversation)

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
    },
  })

  const { mutate: mutateAdd, isPending: addParticipantIsPending } = useMutation({
    mutationFn: async ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
      return await addConversationParticipants({
        data: { conversationId: conversation.id, assistantIds, userIds },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, user?.id],
      })
      dialogRef.current?.close()
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    event.preventDefault()
    mutateRemove({ participantId })
  }

  const handleSubmit = ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
    mutateAdd({ assistantIds, userIds })
  }

  if (user == null || !user?.id) {
    return <></>
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending || addParticipantIsPending} />
      <ParticipantsDialog
        conversation={props.conversation}
        assistants={props.assistants}
        humans={props.humans}
        onSubmit={handleSubmit}
        dialogRef={dialogRef}
      />
      {conversation.participants.map((participant) => (
        <div
          key={participant.id}
          className={twMerge(
            'badge badge-lg text-nowrap text-xs',
            participant.assistantId && 'badge-secondary',
            participant.userId && 'badge-primary',
          )}
        >
          {participant.userId !== user?.id && (
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={(event) => handleRemoveParticipant(event, participant.id)}
            >
              <CrossIcon />
            </button>
          )}
          {participant.name}
        </div>
      ))}
      <button type="button" className="btn btn-neutral btn-xs" onClick={() => dialogRef.current?.showModal()}>
        <PlusIcon />
        {t('actions.add')}...
      </button>
    </div>
  )
}
