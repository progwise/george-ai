import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addConversationParticipants, removeConversationParticipant } from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsDialog } from './participants-dialog'

const ConversationParticipants_ConversationFragment = graphql(`
  fragment ConversationParticipants_Conversation on AiConversation {
    id
    participants {
      id
      name
      userId
      assistantId
    }
    ...ParticipantsDialog_Conversation
  }
`)

const ConversationParticipants_AssistantsFragment = graphql(`
  fragment ConversationParticipants_Assistants on AiAssistant {
    id
    ...ParticipantsDialog_Assistants
  }
`)

export const ConversationParticipants_HumansFragment = graphql(`
  fragment ConversationParticipants_Humans on User {
    id
    username
    ...ParticipantsDialog_Humans
  }
`)

interface ConversationParticipantsProps {
  conversation: FragmentType<typeof ConversationParticipants_ConversationFragment>
  assistants: FragmentType<typeof ConversationParticipants_AssistantsFragment>[]
  humans: FragmentType<typeof ConversationParticipants_HumansFragment>[]
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const authContext = useAuth()
  const user = authContext.user

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)
  const assistants = useFragment(ConversationParticipants_AssistantsFragment, props.assistants)
  const humans = useFragment(ConversationParticipants_HumansFragment, props.humans)

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

  if (!user) {
    return (
      <button type="button" className="btn btn-outline" onClick={() => authContext?.login()}>
        {t('texts.signInForConversations')}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending || addParticipantIsPending} />
      <ParticipantsDialog
        conversation={conversation}
        assistants={assistants}
        humans={humans}
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
