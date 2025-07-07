import { useMemo, useState } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { CrossIcon } from '../icons/cross-icon'
import { AssistantIcon } from './assistant/assistant-icon'
import { UserAvatar } from './user-avatar'

interface ConversationParticipant {
  __typename: 'HumanParticipant' | 'AssistantParticipant'
  id: string
  name: string
  userId?: string | null
  assistantId?: string | null
  user?: {
    avatarUrl?: string | null
    username?: string | null
  } | null
  assistant?: {
    iconUrl?: string | null
    updatedAt?: string | null
  } | null
}

interface ConversationParticipantsViewerProps {
  participants: ConversationParticipant[]
  ownerId: string
  userId: string
  isOwner: boolean
  onRemoveParticipant?: (participantId: string) => void
  className?: string
}

export const ConversationParticipantsViewer = ({
  participants,
  ownerId,
  userId,
  isOwner,
  onRemoveParticipant,
  className,
}: ConversationParticipantsViewerProps) => {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState<string>('')
  const isSearchEnabled = useMemo(() => userSearch.length >= 2, [userSearch])

  const displayedParticipants = useMemo(() => {
    if (!isSearchEnabled) return participants

    const search = userSearch.toLowerCase()
    return participants.filter((participant) => {
      return participant.name.toLowerCase().includes(search)
    })
  }, [participants, userSearch, isSearchEnabled])

  const showNoParticipantsFound = isSearchEnabled && displayedParticipants.length < 1

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="text"
        onChange={(event) => setUserSearch(event.currentTarget.value)}
        name="participantSearch"
        placeholder={t('placeholders.searchUsers')}
        className="input input-sm w-full shrink-0"
      />

      {showNoParticipantsFound && <p className="text-base-content/70 text-sm">{t('texts.noUsersFound')}</p>}

      {displayedParticipants.length > 0 && (
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {displayedParticipants.map((participant) => {
            const isParticipantOwner = participant.userId === ownerId
            const canRemove = participant.userId !== userId && isOwner && onRemoveParticipant
            const displayName = participant.name

            return (
              <div
                key={participant.id}
                className="hover:bg-base-200 flex items-center justify-between rounded px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {participant.__typename === 'AssistantParticipant' ? (
                    <div className="size-6 flex-none overflow-hidden rounded-full">
                      <AssistantIcon
                        assistant={{
                          id: participant.assistantId!,
                          name: participant.name,
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
                        avatarUrl: participant.user?.avatarUrl || null,
                        name: participant.name,
                        username: participant.user?.username || '',
                      }}
                      className="size-6 flex-none"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm" title={displayName}>
                      {displayName}
                    </span>
                    {isParticipantOwner && <span className="text-warning text-xs">({t('conversations.owner')})</span>}
                  </div>
                </div>

                {canRemove && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content tooltip tooltip-left flex-none"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemoveParticipant(participant.id)
                    }}
                    data-tip={t('actions.remove')}
                  >
                    <CrossIcon className="size-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
