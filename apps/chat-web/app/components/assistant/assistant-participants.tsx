import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { queryKeys } from '../../query-keys'
import { removeAssistantParticipant } from '../../server-functions/assistantParticipations'
import { User } from '../../server-functions/users'
import { LoadingSpinner } from '../loading-spinner'
import { AssistantParticipantsDialog } from './assistant-participants-dialog'

const AssistantParticipants_AssistantFragment = graphql(`
  fragment AssistantParticipants_Assistant on AiAssistant {
    id
    ownerId
    participants {
      id
      userId
      name
    }
    ...AssistantParticipantsDialog_Assistant
  }
`)

interface AssistantParticipantsProps {
  assistant: FragmentType<typeof AssistantParticipants_AssistantFragment>
  users: User[]
  userId: string
}

export const AssistantParticipants = (props: AssistantParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const assistant = useFragment(AssistantParticipants_AssistantFragment, props.assistant)
  const { users } = props

  const isOwner = assistant.ownerId === props.userId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeAssistantParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.AiAssistant, assistant.id],
      })

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.AiAssistants, props.userId],
      })
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    if (!isOwner) {
      console.error('Only the assistant owner can remove participants')
      return
    }
    event.preventDefault()
    mutateRemove({ participantId })
  }

  return (
    <div>
      <LoadingSpinner isLoading={removeParticipantIsPending} />
      {assistant.participants.map((participant) => {
        const isParticipantOwner = participant.userId === props.userId
        return (
          <div
            key={participant.id}
            className={twMerge(
              'badge badge-primary badge-lg text-nowrap text-xs',
              isParticipantOwner && 'badge-accent',
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
            <span>{participant.name}</span>
            {isParticipantOwner && <span className="pl-1 font-bold">({t('conversations.owner')})</span>}
          </div>
        )
      })}
      {isOwner && <AssistantParticipantsDialog assistant={assistant} users={users} userId={props.userId} />}
    </div>
  )
}
