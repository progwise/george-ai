import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { graphql } from '../../gql'
import { ListParticipants_ListFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { DialogForm } from '../dialog-form'
import { DropdownContent } from '../dropdown-content'
import { toastError, toastSuccess } from '../georgeToaster'
import { removeListParticipant } from '../list-participations'
import { ParticipantsViewer } from '../participants-viewer'
import { UserAvatar } from '../user-avatar'
import { getListQueryOptions } from './get-list'
import { getListsQueryOptions } from './get-lists'
import { ListParticipantsDialogButton } from './list-participants-dialog-button'

const MAX_VISIBLE_PARTICIPANTS = 4

graphql(`
  fragment ListParticipants_List on AiList {
    id
    owner {
      id
      name
      username
      avatarUrl
    }
    users {
      id
      name
      username
      avatarUrl
    }
    ...ListParticipantsDialogButton_List
  }
`)

interface ListParticipantsProps {
  list: ListParticipants_ListFragment
  users: UserFragment[]
  userId: string
}

export const ListParticipants = ({ list, users, userId }: ListParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string } | null>(null)

  const isOwner = list.ownerId === userId
  const visibleParticipants = list.users.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const remainingCount = list.users.length - MAX_VISIBLE_PARTICIPANTS

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ userId, listId }: { userId: string; listId: string }) => {
      return await removeListParticipant({ data: { userId, listId } })
    },
    onSuccess: async (data) => {
      setParticipantToRemove(null)
      dialogRef.current?.close()
      toastSuccess(t('notifications.participantRemoved'))
      if (data.removeListParticipant.id === userId) {
        // If the current user removed themselves, we can also update the lists query to remove the list
        await queryClient.invalidateQueries(getListsQueryOptions())
        await navigate({ to: '/lists' })
      } else {
        await queryClient.invalidateQueries(getListQueryOptions(list.id))
        await queryClient.invalidateQueries(getListsQueryOptions())
      }
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
    const participant = list.users.find((user) => user.id === participantId)
    if (participant) {
      setParticipantToRemove({ id: participantId, name: participant.name ?? participant.username })
      dialogRef.current?.showModal()
    }
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      mutateRemove({ userId: participantToRemove.id, listId: list.id })
    }
  }

  return (
    <div className="p-0">
      <div className="flex -space-x-2 overflow-visible px-2 py-0 transition-all duration-300 hover:space-x-1">
        <div className="relative transition-transform">
          <span
            className="tooltip tooltip-bottom cursor-pointer"
            data-tip={`${list.owner.name}  (${t('lists.owner')})`}
          >
            <UserAvatar user={list.owner} className="size-8" />
          </span>
          <div className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5" data-tip={t('lists.owner')}>
            <OwnerIcon className="size-5" />
          </div>
        </div>
        {visibleParticipants.map((participant) => {
          const canRemove = participant.id === userId || isOwner

          return (
            <div key={participant.id} className="relative transition-transform">
              <span
                className="tooltip tooltip-bottom cursor-pointer"
                data-tip={participant.name ?? participant.username}
              >
                <UserAvatar user={participant} className="size-8" />
              </span>

              {canRemove && (
                <button
                  type="button"
                  className="bg-error ring-base-100 tooltip tooltip-bottom absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
                  data-tip={t('actions.remove')}
                  onClick={(event) => {
                    handleRemoveParticipant(event, participant.id, participant.name ?? participant.username)
                  }}
                >
                  <CrossIcon className="text-error-content size-2" />
                </button>
              )}
            </div>
          )
        })}

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
                  participants={list.users}
                  ownerId={list.ownerId}
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

      {isOwner && <ListParticipantsDialogButton list={list} users={users} />}

      <DialogForm
        ref={dialogRef}
        title={t('lists.removeParticipant')}
        description={t('lists.removeParticipantConfirmation', { participantName: participantToRemove?.name || '' })}
        onSubmit={confirmRemoveParticipant}
        disabledSubmit={removeParticipantIsPending}
        submitButtonText={t('actions.remove')}
      />
    </div>
  )
}
