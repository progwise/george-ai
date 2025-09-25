import { useRouteContext } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { AssistantIcon } from '../assistant/assistant-icon'
import { UserAvatar } from '../user-avatar'
import { EntityParticipant } from './entity-participant.types'

interface ParticipantsViewerProps {
  participants: EntityParticipant[]
  isOwner: boolean
  onRemoveParticipant?: (participant: EntityParticipant) => void
}

export const ParticipantsViewer = ({ participants, isOwner, onRemoveParticipant }: ParticipantsViewerProps) => {
  const { user: currentUser } = useRouteContext({ strict: false })
  const { t } = useTranslation()

  if (!currentUser) {
    return null
  }

  return (
    <div className={`flex flex-col gap-2`}>
      {participants.length < 1 && <p className="text-base-content/70 text-sm">{t('texts.noUsersFound')}</p>}

      {participants.length > 0 && (
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {participants.map((participant) => (
            <label key={participant.id} className="flex justify-between gap-2">
              <div className="flex gap-2">
                {participant.user && <UserAvatar user={participant.user} className="size-6 flex-none" />}
                {participant.assistant && (
                  <AssistantIcon assistant={participant.assistant} className="size-6 flex-none" />
                )}
                <span>{participant.user?.name || participant.assistant?.name || t('lists.unknownParticipant')}</span>
              </div>
              <button
                type="button"
                className="btn btn-circle btn-xs"
                disabled={!isOwner}
                onClick={() => onRemoveParticipant?.(participant)}
              >
                <CrossIcon className="size-4" />
              </button>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
