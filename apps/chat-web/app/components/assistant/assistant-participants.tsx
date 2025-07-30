import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { graphql } from '../../gql'
import { AssistantParticipants_AssistantFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { removeAssistantParticipant } from '../../server-functions/assistant-participations'
import { DialogForm } from '../dialog-form'
import { DropdownContent } from '../dropdown-content'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsViewer } from '../participants-viewer'
import { UserAvatar } from '../user-avatar'
import { AssistantParticipantsDialogButton } from './assistant-participants-dialog-button'
import { getAssistantQueryOptions } from './get-assistant'
import { getAiAssistantsQueryOptions } from './get-assistants'

const MAX_VISIBLE_PARTICIPANTS = 4

graphql(`
  fragment AssistantParticipants_Assistant on AiAssistant {
    id
    ownerId
    users {
      id
      name
      username
      avatarUrl
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string } | null>(null)

  const isOwner = assistant.ownerId === userId
  const visibleParticipants = assistant.users.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = assistant.users.length - MAX_VISIBLE_PARTICIPANTS

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ userId, assistantId }: { userId: string; assistantId: string }) => {
      return await removeAssistantParticipant({
        data: {
          userId,
          assistantId,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id))
      await queryClient.invalidateQueries(getAiAssistantsQueryOptions())
      setParticipantToRemove(null)
      dialogRef.current?.close()
      toastSuccess(t('notifications.participantRemoved'))
    },
    onError: (error) => {
      toastError(t('errors.removeParticipantFailed', { error: error.message }))
    },
  })

  const handleRemoveParticipant = (
    event: React.MouseEvent<HTMLButtonElement>,
    participantId: string,
    participantName: string,
  ) => {
    event.preventDefault()
    setParticipantToRemove({ id: participantId, name: participantName })
    dialogRef.current?.showModal()
  }

  const handleRemoveParticipantFromDropdown = (participantId: string) => {
    const participant = assistant.users.find((user) => user.id === participantId)
    if (participant) {
      const displayName = participant.name ?? participant.username
      setParticipantToRemove({ id: participantId, name: displayName })
      dialogRef.current?.showModal()
    }
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      mutateRemove({ userId: participantToRemove.id, assistantId: assistant.id })
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-visible">
      <LoadingSpinner isLoading={removeParticipantIsPending} />

      <div className="flex -space-x-2 overflow-visible px-2 py-1 transition-all duration-300 hover:space-x-1">
        {visibleParticipants.map((participant) => {
          const isParticipantOwner = participant.id === assistant.ownerId
          const canRemoveParticipant = participant.id !== userId && isOwner

          return (
            <div key={participant.id} className="relative transition-transform">
              <span
                className="tooltip tooltip-bottom cursor-pointer"
                data-tip={`${participant.name ?? participant.username}${isParticipantOwner ? ` (${t('assistants.owner')})` : ''}`}
              >
                <UserAvatar user={participant} className="size-8" />
              </span>

              {isParticipantOwner && (
                <div className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5" data-tip={t('assistants.owner')}>
                  <OwnerIcon className="size-4" />
                </div>
              )}

              {canRemoveParticipant && (
                <button
                  type="button"
                  className="bg-error ring-base-100 tooltip tooltip-bottom absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
                  data-tip={t('actions.remove')}
                  onClick={(event) =>
                    handleRemoveParticipant(event, participant.id, participant.name ?? participant.username)
                  }
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
                <ParticipantsViewer
                  participants={assistant.users}
                  ownerId={assistant.ownerId}
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

      {isOwner && <AssistantParticipantsDialogButton assistant={assistant} users={users} />}

      <DialogForm
        ref={dialogRef}
        title={t('assistants.removeParticipant')}
        description={t('assistants.removeParticipantConfirmation', {
          participantName: participantToRemove?.name || '',
        })}
        onSubmit={confirmRemoveParticipant}
        disabledSubmit={removeParticipantIsPending}
        submitButtonText={t('actions.remove')}
      />
    </div>
  )
}
