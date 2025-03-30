import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { CrossIcon } from '../../icons/cross-icon'
import { queryKeys } from '../../query-keys'
import { removeConversationParticipant } from '../../server-functions/participations'
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
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const authContext = useAuth()
  const user = authContext.user

  const queryClient = useQueryClient()

  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)
  const assistants = useFragment(ConversationParticipants_AssistantFragment, props.assistants)
  const humans = useFragment(ConversationParticipants_HumanFragment, props.humans)

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

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    event.preventDefault()
    mutateRemove({ participantId })
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending} />

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

      <ParticipantsDialog conversation={conversation} assistants={assistants} humans={humans} dialogMode="add" />
    </div>
  )
}
