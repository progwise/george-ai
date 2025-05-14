import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { removeConversationParticipant } from '../../server-functions/conversation-participations'
import { getConversationQueryOptions, getConversationsQueryOptions } from '../../server-functions/conversations'
import { User } from '../../server-functions/users'
import { LoadingSpinner } from '../loading-spinner'
import { ConversationParticipantsDialogButton } from './conversation-participants-dialog-button'

const ConversationParticipants_ConversationFragment = graphql(`
  fragment ConversationParticipants_Conversation on AiConversation {
    id
    ownerId
    participants {
      id
      name
      userId
      assistantId
    }
    ...ConversationParticipantsDialogButton_Conversation
  }
`)

const ConversationParticipants_AssistantFragment = graphql(`
  fragment ConversationParticipants_Assistant on AiAssistant {
    ...ConversationParticipantsDialogButton_Assistant
  }
`)

interface ConversationParticipantsProps {
  conversation: FragmentType<typeof ConversationParticipants_ConversationFragment>
  assistants: FragmentType<typeof ConversationParticipants_AssistantFragment>[]
  users: User[]
  userId: string
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)
  const assistants = useFragment(ConversationParticipants_AssistantFragment, props.assistants)
  const { users } = props

  const isOwner = props.userId === conversation.ownerId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationQueryOptions(conversation.id))
      await queryClient.invalidateQueries(getConversationsQueryOptions(props.userId))
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    if (!isOwner) {
      console.error('Only the conversation owner can remove participants')
      return
    }
    event.preventDefault()
    mutateRemove({ participantId })
  }

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-scroll lg:py-1">
      <LoadingSpinner isLoading={removeParticipantIsPending} />
      {conversation.participants.map((participant) => {
        const isParticipantOwner = participant.userId === conversation.ownerId
        return (
          <div
            key={participant.id}
            className={twMerge(
              'badge badge-lg text-nowrap text-xs',
              participant.userId && 'badge-primary',
              isParticipantOwner && 'badge-accent',
              participant.assistantId && 'badge-secondary',
            )}
          >
            {participant.userId !== props.userId && isOwner && (
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                onClick={(event) => handleRemoveParticipant(event, participant.id)}
              >
                <CrossIcon />
              </button>
            )}
            <span className="max-w-36 truncate">{participant.name}</span>
            {isParticipantOwner && <span className="pl-1 font-bold">({t('conversations.owner')})</span>}
          </div>
        )
      })}
      {isOwner && (
        <div className="max-lg:hidden">
          <ConversationParticipantsDialogButton
            conversation={conversation}
            assistants={assistants}
            users={users}
            dialogMode="add"
            userId={props.userId}
          />
        </div>
      )}
    </div>
  )
}
