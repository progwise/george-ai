import { useRouteContext } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { User_EntityParticipantsDialogFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { AssistantIcon } from '../assistant/assistant-icon'
import { DialogForm } from '../dialog-form'
import { UserAvatar } from '../user-avatar'
import { EntityParticipant } from './entity-participant.types'
import { ParticipantsViewer } from './participants-viewer'

const MAX_VISIBLE_PARTICIPANTS = 4

interface EntityParticipantsProps {
  entityName: string
  owner: User_EntityParticipantsDialogFragment
  participants: EntityParticipant[]
  onRemoveParticipant: (participantId: string) => void
  disabled?: boolean
}

export const EntityParticipants = ({
  entityName,
  owner,
  participants,
  onRemoveParticipant,
  disabled,
}: EntityParticipantsProps) => {
  const { user: currentUser } = useRouteContext({ strict: false })
  const { t } = useTranslation()
  const confirmRemoveDialogRef = useRef<HTMLDialogElement>(null)
  const [participantToRemove, setParticipantToRemove] = useState<EntityParticipant | null>(null)

  const visibleParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = participants.length - MAX_VISIBLE_PARTICIPANTS

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participant: EntityParticipant) => {
    event.preventDefault()
    setParticipantToRemove(participant)
    confirmRemoveDialogRef.current?.showModal()
  }

  const handleRemoveParticipantFromDropdown = (participant: EntityParticipant) => {
    setParticipantToRemove(participant)
    confirmRemoveDialogRef.current?.showModal()
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      onRemoveParticipant(participantToRemove.id)
      confirmRemoveDialogRef.current?.close()
    }
  }

  if (!currentUser) {
    return null
  }

  const isOwner = currentUser.id === owner.id

  return (
    <section className="m-0 p-0">
      <div className="animate flex flex-nowrap -space-x-2 overflow-visible px-2 py-0 hover:space-x-1">
        <div className="relative transition-all duration-100">
          <span
            className="tooltip tooltip-bottom tooltip-info cursor-pointer"
            data-tip={`${owner.name}  (${t('lists.owner')})`}
          >
            <UserAvatar user={owner} className="size-8" />
          </span>
          <div className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5" data-tip={t('lists.owner')}>
            <OwnerIcon className="size-5" />
          </div>
        </div>
        {visibleParticipants.map((participant) => (
          <div key={participant.id} className="relative transition-all duration-100">
            <span
              className="tooltip tooltip-bottom tooltip-info cursor-pointer"
              data-tip={participant.user?.username || participant.assistant?.name || t('lists.unknownParticipant')}
            >
              {participant.user && <UserAvatar user={participant.user} className="size-8" />}
              {participant.assistant && <AssistantIcon assistant={participant.assistant} className="size-8" />}
            </span>

            {(participant.id === currentUser.id || isOwner) && (
              <button
                type="button"
                className="bg-error ring-base-100 absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
                onClick={(event) => {
                  handleRemoveParticipant(event, participant)
                }}
              >
                <CrossIcon className="text-error-content size-2" />
              </button>
            )}
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="dropdown dropdown-hover dropdown-end relative">
            <div
              tabIndex={0}
              role="button"
              className="bg-neutral text-neutral-content border-base-content hover:bg-neutral-focus flex size-8 items-center justify-center rounded-full border transition-transform"
            >
              <span className="text-xs font-medium">+{remainingCount}</span>
            </div>

            <div className="dropdown-content top-5 z-50 w-64">
              <div className="bg-base-100 rounded-box border-base-300 before:bg-base-100 before:border-base-300 after:bg-base-100 relative z-20 cursor-pointer border p-2 shadow-lg before:absolute before:-top-2 before:right-4 before:-z-10 before:h-4 before:w-4 before:rotate-45 before:transform before:border-l before:border-t before:content-[''] after:absolute after:right-2.5 after:top-0 after:z-10 after:h-1 after:w-7 after:content-['']">
                <ParticipantsViewer
                  participants={participants}
                  isOwner={isOwner}
                  onRemoveParticipant={handleRemoveParticipantFromDropdown}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogForm
        ref={confirmRemoveDialogRef}
        title={t('labels.removeParticipantConfirmationTitle')}
        description={t('labels.removeParticipantConfirmation')}
        onSubmit={confirmRemoveParticipant}
        disabledSubmit={disabled}
        submitButtonText={t('actions.confirm')}
      >
        <>
          <p>
            Remove <b>{participantToRemove?.user?.username}</b> from <b>{entityName}</b>
          </p>
        </>
      </DialogForm>
    </section>
  )
}
