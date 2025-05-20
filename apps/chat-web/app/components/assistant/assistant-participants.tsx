import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { AssistantParticipants_AssistantFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { removeAssistantParticipant } from '../../server-functions/assistant-participations'
import { LoadingSpinner } from '../loading-spinner'
import { AssistantParticipantsDialogButton } from './assistant-participants-dialog-button'

graphql(`
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
  assistant: AssistantParticipants_AssistantFragment
  users: UserFragment[]
  userId: string
}

export const AssistantParticipants = ({ assistant, users, userId }: AssistantParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const isOwner = assistant.ownerId === userId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ userId, assistantId }: { userId: string; assistantId: string }) => {
      return await removeAssistantParticipant({
        data: {
          userId,
          assistantId,
          currentUserId: userId,
        },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id))
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
                'badge badge-lg text-nowrap text-xs',
                isParticipantOwner ? 'badge-accent' : 'badge-primary',
              )}
            >
              {participant.id !== userId && isOwner && (
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
      {isOwner && <AssistantParticipantsDialogButton assistant={assistant} users={users} userId={userId} />}
    </div>
  )
}
