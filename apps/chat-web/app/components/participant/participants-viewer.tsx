import { useRouteContext } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { AssistantIcon } from '../assistant/assistant-icon'
import { UserAvatar } from '../user-avatar'
import { EntityParticipant } from './entity-participant.types'

interface ParticipantsViewerProps {
  participants: EntityParticipant[]
  isOwner: boolean
  onRemoveParticipant?: (participant: EntityParticipant) => void
  className?: string
  maxVisibleParticipants?: number
  skipParticipants?: number
}

export const ParticipantsViewer = ({
  participants,
  isOwner,
  onRemoveParticipant,
  className,
  maxVisibleParticipants,
}: ParticipantsViewerProps) => {
  const { user: currentUser } = useRouteContext({ strict: false })
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState<string>('')
  const isSearchEnabled = useMemo(() => userSearch.length >= 2, [userSearch])

  const displayedParticipants = useMemo(() => {
    let filteredParticipants = participants

    // Apply search filter if enabled
    if (isSearchEnabled) {
      const search = userSearch.toLowerCase()
      filteredParticipants = filteredParticipants.filter((participant) => {
        return (
          participant.user?.name?.toLowerCase().includes(search) ||
          participant.assistant?.name.toLowerCase().includes(search)
        )
      })
    }

    // Apply max visible participants limit if specified
    if (maxVisibleParticipants && maxVisibleParticipants > 0) {
      return filteredParticipants.slice(0, maxVisibleParticipants)
    }

    return filteredParticipants
  }, [participants, userSearch, isSearchEnabled, maxVisibleParticipants])

  const showNoParticipantsFound = isSearchEnabled && displayedParticipants.length < 1

  if (!currentUser) {
    return null
  }

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
          {displayedParticipants.map((participant) => (
            <div key={participant.id} className="hover:bg-base-200 flex items-center justify-between rounded px-3 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {participant.user && <UserAvatar user={participant.user} className="size-6 flex-none" />}
                {participant.assistant && (
                  <AssistantIcon assistant={participant.assistant} className="size-6 flex-none" />
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className="block truncate text-sm"
                    title={participant.user?.name || participant.assistant?.name || ''}
                  >
                    {participant.user?.name || participant.assistant?.name || t('lists.unknownParticipant')}
                  </span>
                </div>
              </div>

              {(isOwner || currentUser.id === participant.user?.id) && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content tooltip tooltip-left flex-none"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveParticipant?.(participant)
                  }}
                  data-tip={t('actions.remove')}
                >
                  <CrossIcon className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
