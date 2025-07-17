import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { graphql } from '../../gql'
import { LibraryParticipants_LibraryFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { removeLibraryParticipant } from '../../server-functions/library-participations'
import { DialogForm } from '../dialog-form'
import { DropdownContent } from '../dropdown-content'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsViewer } from '../participants-viewer'
import { UserAvatar } from '../user-avatar'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'
import { LibraryParticipantsDialogButton } from './library-participants-dialog-button'

graphql(`
  fragment LibraryParticipants_Library on AiLibrary {
    id
    ownerId
    participants {
      id
      name
      username
      avatarUrl
    }
    ...LibraryParticipantsDialogButton_Library
  }
`)

interface LibraryParticipantsProps {
  library: LibraryParticipants_LibraryFragment
  users: UserFragment[]
  userId: string
}

export const LibraryParticipants = ({ library, users, userId }: LibraryParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string } | null>(null)

  const isOwner = library.ownerId === userId
  const MAX_VISIBLE_PARTICIPANTS = 4
  const visibleParticipants = library.participants.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = library.participants.length - MAX_VISIBLE_PARTICIPANTS

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ userId, libraryId }: { userId: string; libraryId: string }) => {
      return await removeLibraryParticipant({ data: { userId, libraryId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibraryQueryOptions(library.id))
      await queryClient.invalidateQueries(getLibrariesQueryOptions())
      setParticipantToRemove(null)
      dialogRef.current?.close()
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
    const participant = library.participants.find((participant) => participant.id === participantId)
    if (participant) {
      setParticipantToRemove({ id: participantId, name: participant.name ?? participant.username })
      dialogRef.current?.showModal()
    }
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      mutateRemove({ userId: participantToRemove.id, libraryId: library.id })
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-visible">
      <LoadingSpinner isLoading={removeParticipantIsPending} />

      <div className="flex -space-x-2 overflow-visible px-2 py-1 transition-all duration-300 hover:space-x-1">
        {visibleParticipants.map((participant) => {
          const isParticipantOwner = participant.id === library.ownerId
          const canRemove = participant.id !== userId && isOwner

          return (
            <div key={participant.id} className="relative transition-transform">
              <span
                className="tooltip tooltip-bottom cursor-pointer"
                data-tip={`${participant.name ?? participant.username}${isParticipantOwner ? ` (${t('libraries.owner')})` : ''}`}
              >
                <UserAvatar user={participant} className="size-8" />
              </span>

              {isParticipantOwner && (
                <div className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5" data-tip={t('libraries.owner')}>
                  <OwnerIcon className="size-5" />
                </div>
              )}

              {canRemove && (
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
                  participants={library.participants}
                  ownerId={library.ownerId}
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

      {isOwner && <LibraryParticipantsDialogButton library={library} users={users} />}

      <DialogForm
        ref={dialogRef}
        title={t('libraries.removeParticipant')}
        description={t('libraries.removeParticipantConfirmation', { participantName: participantToRemove?.name || '' })}
        onSubmit={confirmRemoveParticipant}
        disabledSubmit={removeParticipantIsPending}
        submitButtonText={t('actions.remove')}
      />
    </div>
  )
}
