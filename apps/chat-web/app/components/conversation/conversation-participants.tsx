import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { queryKeys } from '../../query-keys'
import { removeConversationParticipant } from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsDialog } from './participants-dialog'

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
    ...ParticipantsDialog_Conversation
  }
`)

const ConversationParticipants_AssistantFragment = graphql(`
  fragment ConversationParticipants_Assistant on AiAssistant {
    ...ParticipantsDialog_Assistant
  }
`)

export const ConversationParticipants_HumanFragment = graphql(`
  fragment ConversationParticipants_Human on User {
    ...ParticipantsDialog_Human
  }
`)

interface ConversationParticipantsProps {
  conversation: FragmentType<typeof ConversationParticipants_ConversationFragment>
  assistants: FragmentType<typeof ConversationParticipants_AssistantFragment>[]
  humans: FragmentType<typeof ConversationParticipants_HumanFragment>[]
  userId: string
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)
  const assistants = useFragment(ConversationParticipants_AssistantFragment, props.assistants)
  const humans = useFragment(ConversationParticipants_HumanFragment, props.humans)

  const isOwner = props.userId === conversation.ownerId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, props.userId],
      })
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
                className="btn btn-circle btn-ghost btn-xs"
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
          <ParticipantsDialog
            conversation={conversation}
            assistants={assistants}
            humans={humans}
            dialogMode="add"
            userId={props.userId}
          />
        </div>
      )}
    </div>
  )
}
