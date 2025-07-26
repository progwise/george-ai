import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { graphql } from '../../gql'
import { AssistantUsers_AssistantFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { OwnerIcon } from '../../icons/owner-icon'
import { removeAssistantUser } from '../../server-functions/assistant-users'
import { DialogForm } from '../dialog-form'
import { DropdownContent } from '../dropdown-content'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsViewer } from '../participants-viewer'
import { UserAvatar } from '../user-avatar'
import { AssistantUsersDialogButton } from './assistant-users-dialog-button'
import { getAssistantQueryOptions } from './get-assistant'
import { getAiAssistantsQueryOptions } from './get-assistants'

const MAX_VISIBLE_USERS = 4

graphql(`
  fragment AssistantUsers_Assistant on AiAssistant {
    id
    ownerId
    users {
      id
      name
      username
      avatarUrl
    }
    ...AssistantUsersDialogButton_Assistant
  }
`)

interface AssistantUsersProps {
  assistant: AssistantUsers_AssistantFragment
  users: UserFragment[]
  userId: string
}

export const AssistantUsers = ({ assistant, users, userId }: AssistantUsersProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [userToRemove, setUserToRemove] = useState<{ id: string; name: string } | null>(null)

  const isOwner = assistant.ownerId === userId
  const visibleUsers = assistant.users.slice(0, MAX_VISIBLE_USERS)
  const remainingCount = assistant.users.length - MAX_VISIBLE_USERS

  const { mutate: mutateRemove, isPending: removeUserIsPending } = useMutation({
    mutationFn: async ({ userId, assistantId }: { userId: string; assistantId: string }) => {
      return await removeAssistantUser({
        data: {
          userId,
          assistantId,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id))
      await queryClient.invalidateQueries(getAiAssistantsQueryOptions())
      setUserToRemove(null)
      dialogRef.current?.close()
      toastSuccess(t('notifications.participantRemoved'))
    },
    onError: (error) => {
      toastError(t('errors.removeParticipantFailed', { error: error.message }))
    },
  })

  const handleRemoveUser = (event: React.MouseEvent<HTMLButtonElement>, userId: string, userName: string) => {
    event.preventDefault()
    setUserToRemove({ id: userId, name: userName })
    dialogRef.current?.showModal()
  }

  const handleRemoveUserFromDropdown = (userId: string) => {
    const user = assistant.users.find((user) => user.id === userId)
    if (user) {
      const displayName = user.name ?? user.username
      setUserToRemove({ id: userId, name: displayName })
      dialogRef.current?.showModal()
    }
  }

  const confirmRemoveUser = () => {
    if (userToRemove) {
      mutateRemove({ userId: userToRemove.id, assistantId: assistant.id })
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-visible">
      <LoadingSpinner isLoading={removeUserIsPending} />

      <div className="flex -space-x-2 overflow-visible px-2 py-1 transition-all duration-300 hover:space-x-1">
        {visibleUsers.map((user) => {
          const isUserOwner = user.id === assistant.ownerId
          const canRemoveUser = user.id !== userId && isOwner

          return (
            <div key={user.id} className="relative transition-transform">
              <span
                className="tooltip tooltip-bottom cursor-pointer"
                data-tip={`${user.name ?? user.username}${isUserOwner ? ` (${t('assistants.owner')})` : ''}`}
              >
                <UserAvatar user={user} className="size-8" />
              </span>

              {isUserOwner && (
                <div className="tooltip tooltip-bottom absolute -right-0.5 -top-0.5" data-tip={t('assistants.owner')}>
                  <OwnerIcon className="size-4" />
                </div>
              )}

              {canRemoveUser && (
                <button
                  type="button"
                  className="bg-error ring-base-100 tooltip tooltip-bottom absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 transition-transform hover:scale-110"
                  data-tip={t('actions.remove')}
                  onClick={(event) => handleRemoveUser(event, user.id, user.name ?? user.username)}
                >
                  <CrossIcon className="text-error-content size-2" />
                </button>
              )}
            </div>
          )
        })}

        {/* Remaining users */}
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
                  onRemoveParticipant={handleRemoveUserFromDropdown}
                  skipFirst={MAX_VISIBLE_USERS}
                />
              </DropdownContent>
            </div>
          </div>
        )}
      </div>

      {isOwner && <AssistantUsersDialogButton assistant={assistant} users={users} />}

      <DialogForm
        ref={dialogRef}
        title={t('assistants.removeParticipant')}
        description={t('assistants.removeParticipantConfirmation', {
          participantName: userToRemove?.name || '',
        })}
        onSubmit={confirmRemoveUser}
        disabledSubmit={removeUserIsPending}
        submitButtonText={t('actions.remove')}
      />
    </div>
  )
}
