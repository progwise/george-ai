import { useMutation, useQueryClient } from '@tanstack/react-query'

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
import { LoadingSpinner } from '../loading-spinner'
import { UserAvatar } from '../user-avatar'
import { ConversationParticipantsDialogButton } from './conversation-participants-dialog-button'
import { getConversationQueryOptions } from './get-conversation'
import { getConversationsQueryOptions } from './get-conversations'

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

  const isOwner = userId === conversation.ownerId
  const MAX_VISIBLE_PARTICIPANTS = 4
  const visibleParticipants = conversation.participants.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = conversation.participants.length - MAX_VISIBLE_PARTICIPANTS

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationQueryOptions(conversation.id))
      await queryClient.invalidateQueries(getConversationsQueryOptions())
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

  const handleRemoveParticipantFromDropdown = (participantId: string) => {
    mutateRemove({ participantId })
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
                data-tip={`${participant.name}${isParticipantOwner ? ` (${t('conversations.owner')})` : ''}`}
              >
                {participant.__typename === 'AssistantParticipant' ? (
                  <div className="size-8 overflow-hidden rounded-full">
                    <AssistantIcon
                      assistant={{
                        id: participant.assistantId!,
                        name: participant.name || 'Unknown Assistant',
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
                      avatarUrl:
                        participant.__typename === 'HumanParticipant' && participant.user
                          ? participant.user.avatarUrl
                          : null,
                      name: participant.name || '',
                      username: participant.name || '',
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
                  onClick={(event) => handleRemoveParticipant(event, participant.id)}
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
              <div className="bg-base-100 rounded-box border-base-300 before:bg-base-100 before:border-base-300 after:bg-base-100 relative z-20 border p-2 shadow-lg before:absolute before:-top-2 before:right-4 before:-z-10 before:h-4 before:w-4 before:rotate-45 before:transform before:border-l before:border-t before:content-[''] after:absolute after:right-2.5 after:top-0 after:z-10 after:h-1 after:w-7 after:content-['']">
                <ConversationParticipantsViewer
                  participants={conversation.participants.slice(MAX_VISIBLE_PARTICIPANTS)}
                  ownerId={conversation.ownerId}
                  userId={userId}
                  isOwner={isOwner}
                  onRemoveParticipant={handleRemoveParticipantFromDropdown}
                />
              </div>
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
    </div>
  )
}
