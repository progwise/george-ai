import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { graphql } from '../../gql'
import {
  ConversationParticipants_AssistantFragment,
  ConversationParticipants_ConversationFragment,
  UserFragment,
} from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { removeConversationParticipant } from '../../server-functions/conversation-participations'
import { AssistantIcon } from '../assistant/assistant-icon'
import { ConversationParticipantsViewer } from '../conversation-participants-viewer'
import { DialogForm } from '../dialog-form'
import { DropdownContent } from '../dropdown-content'
import { LoadingSpinner } from '../loading-spinner'
import { UserAvatar } from '../user-avatar'
import { ConversationParticipantsDialogButton } from './conversation-participants-dialog-button'
import { getConversationQueryOptions } from './get-conversation'
import { getConversationsQueryOptions } from './get-conversations'

const MAX_VISIBLE_PARTICIPANTS = 4

graphql(`
  fragment ConversationParticipants_Conversation on AiConversation {
    ...ConversationBase
    participants {
      __typename
      id
      name
      userId
      assistantId
      ... on HumanParticipant {
        user {
          avatarUrl
          username
        }
      }
      ... on AssistantParticipant {
        assistant {
          iconUrl
          updatedAt
        }
      }
    }
    ...ConversationParticipantsDialogButton_Conversation
  }
`)

graphql(`
  fragment ConversationParticipants_Assistant on AiAssistant {
    ...ConversationParticipantsDialogButton_Assistant
  }
`)

interface ConversationParticipantsProps {
  conversation: ConversationParticipants_ConversationFragment
  assistants: ConversationParticipants_AssistantFragment[]
  users: UserFragment[]
  userId: string
}

export const ConversationParticipants = ({
  conversation,
  assistants,
  users,
  userId,
}: ConversationParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string } | null>(null)

  const isOwner = userId === conversation.ownerId
  const visibleParticipants = conversation.participants.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = conversation.participants.length - MAX_VISIBLE_PARTICIPANTS

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getConversationQueryOptions(conversation.id))
      await queryClient.invalidateQueries(getConversationsQueryOptions())
      setParticipantToRemove(null)
      dialogRef.current?.close()
    },
  })

  const handleRemoveParticipant = (
    event: React.MouseEvent<HTMLButtonElement>,
    participantId: string,
    participantName: string,
  ) => {
    if (!isOwner) {
      console.error('Only the conversation owner can remove participants')
      return
    }
    event.preventDefault()
    setParticipantToRemove({ id: participantId, name: participantName })
    dialogRef.current?.showModal()
  }

  const handleRemoveParticipantFromDropdown = (participantId: string) => {
    const participant = conversation.participants.find((participant) => participant.id === participantId)
    if (participant) {
      setParticipantToRemove({ id: participantId, name: participant.name || 'Unknown' })
      dialogRef.current?.showModal()
    }
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      mutateRemove({ participantId: participantToRemove.id })
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-visible">
      <LoadingSpinner isLoading={removeParticipantIsPending} />

      <div className="flex -space-x-2 overflow-visible px-2 py-1 transition-all duration-300 hover:space-x-1">
        {visibleParticipants.map((participant) => {
          const isParticipantOwner = participant.userId === conversation.ownerId
          const canRemove = participant.userId !== userId && isOwner

          return (
            <div key={participant.id} className="relative transition-transform">
              <span
                className="tooltip tooltip-bottom cursor-pointer"
                data-tip={`${participant.name || 'Unknown'}${isParticipantOwner ? ` (${t('conversations.owner')})` : ''}`}
              >
                {participant.__typename === 'AssistantParticipant' ? (
                  <div className="size-8 overflow-hidden rounded-full">
                    <AssistantIcon
                      assistant={{
                        id: participant.assistantId!,
                        name: participant.name || 'Assistant',
                        description: null,
                        iconUrl: participant.assistant?.iconUrl || null,
                        updatedAt: participant.assistant?.updatedAt || '',
                        ownerId: '',
                      }}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <UserAvatar
                    user={{
                      id: participant.userId || '',
                      username:
                        participant.__typename === 'HumanParticipant' && participant.user
                          ? participant.user.username || ''
                          : participant.name || '',
                      name: participant.name || null,
                      avatarUrl:
                        participant.__typename === 'HumanParticipant' && participant.user
                          ? participant.user.avatarUrl
                          : null,
                    }}
                    className="size-8"
                  />
                )}
              </span>

              {isParticipantOwner && (
                <div
                  className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5"
                  data-tip={t('conversations.owner')}
                >
                  <OwnerIcon className="size-4" />
                </div>
              )}

              {canRemove && (
                <button
                  type="button"
                  className="bg-error ring-base-100 tooltip tooltip-bottom absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
                  data-tip={t('actions.remove')}
                  onClick={(event) => handleRemoveParticipant(event, participant.id, participant.name || 'Unknown')}
                >
                  <CrossIcon className="text-error-content size-2" />
                </button>
              )}
            </div>
          )
        })}

        {/* Remaining participants */}
        {remainingCount > 0 && (
          <div className="dropdown dropdown-hover dropdown-end relative transition-transform">
            <div
              tabIndex={0}
              role="button"
              className="bg-neutral text-neutral-content border-base-content hover:bg-neutral-focus flex size-8 cursor-pointer items-center justify-center rounded-full border"
            >
              <span className="text-xs font-medium">+{remainingCount}</span>
            </div>
            <div className="dropdown-content relative z-[1] mt-2 w-64">
              <DropdownContent>
                <ConversationParticipantsViewer
                  participants={conversation.participants}
                  ownerId={conversation.ownerId}
                  userId={userId}
                  isOwner={isOwner}
                  onRemoveParticipant={handleRemoveParticipantFromDropdown}
                  skipFirst={MAX_VISIBLE_PARTICIPANTS}
                />
              </DropdownContent>
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <ConversationParticipantsDialogButton
          conversation={conversation}
          assistants={assistants}
          users={users}
          dialogMode="add"
          userId={userId}
        />
      )}

      <DialogForm
        ref={dialogRef}
        title={t('conversations.removeParticipant')}
        description={t('conversations.removeParticipantConfirmation', {
          participantName: participantToRemove?.name || '',
        })}
        onSubmit={confirmRemoveParticipant}
        disabledSubmit={removeParticipantIsPending}
        submitButtonText={t('actions.remove')}
      />
    </div>
  )
}
