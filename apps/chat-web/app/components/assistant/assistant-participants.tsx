import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { removeAssistantParticipant } from '../../server-functions/assistantParticipations'
import { User } from '../../server-functions/users'
import { LoadingSpinner } from '../loading-spinner'
import { AssistantParticipantsDialogButton } from './assistant-participants-dialog-button'

const AssistantParticipants_AssistantFragment = graphql(`
  fragment AssistantParticipants_Assistant on AiAssistant {
    id
    ownerId
    participants {
      id
      name
      username
    }
    ...AssistantParticipantsDialogButton_Assistant
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
    mutationFn: async ({ userId, assistantId }: { userId: string; assistantId: string }) => {
      return await removeAssistantParticipant({
        data: {
          userId,
          assistantId,
          currentUserId: props.userId,
        },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId))
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    event.preventDefault()
    mutateRemove({ userId, assistantId: assistant.id })
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-x-scroll">
      <LoadingSpinner isLoading={removeParticipantIsPending} />
      <div className="no-scrollbar flex gap-2 overflow-x-scroll p-1">
        {assistant.participants.map((participant) => {
          const isParticipantOwner = participant.id === assistant.ownerId
          return (
            <div
              key={participant.id}
              className={twMerge(
                'badge badge-primary badge-lg text-nowrap text-xs',
                isParticipantOwner && 'badge-accent',
              )}
            >
              {participant.id !== props.userId && isOwner && (
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-xs"
                  onClick={(event) => handleRemoveParticipant(event, participant.id)}
                >
                  <CrossIcon />
                </button>
              )}
              <span className="max-w-36 truncate">{participant.name ?? participant.username}</span>
              {isParticipantOwner && <span className="pl-1 font-bold">({t('assistants.owner')})</span>}
            </div>
          )
        })}
      </div>
      {isOwner && <AssistantParticipantsDialogButton assistant={assistant} users={users} userId={props.userId} />}
    </div>
  )
}
