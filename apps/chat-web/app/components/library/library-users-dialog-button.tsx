import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { LibraryUsersDialogButton_LibraryFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { addLibraryUsers } from '../../server-functions/library-users'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'

graphql(`
  fragment LibraryUsersDialogButton_Library on AiLibrary {
    id
    ownerId
    users {
      id
    }
  }
`)

interface LibraryUsersDialogFormProps {
  library: LibraryUsersDialogButton_LibraryFragment
  users: UserFragment[]
}

export const LibraryUsersDialogButton = ({ library, users }: LibraryUsersDialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assignableUsers = useMemo(
    () => users.filter((user) => !library.users.some((libraryUser) => libraryUser.id === user.id)),
    [users, library.users],
  )

  const { mutate: addUsers, isPending } = useMutation({
    mutationFn: async () => {
      return await addLibraryUsers({
        data: { libraryId: library.id, userIds: selectedUserIds },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibraryQueryOptions(library.id))
      await queryClient.invalidateQueries(getLibrariesQueryOptions())

      dialogRef.current?.close()
    },
  })

  const handleSubmit = () => {
    addUsers()
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-neutral btn-sm tooltip tooltip-left"
        onClick={handleOpen}
        data-tip={t('actions.add')}
      >
        <PlusIcon />
      </button>

      <LoadingSpinner isLoading={isPending} />
      <DialogForm
        ref={dialogRef}
        title={t('texts.addParticipants')}
        description={t('libraries.addParticipantsConfirmation')}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div className="h-64">
          <h4 className="underline">{t('libraries.users')}</h4>
          <UsersSelector
            users={assignableUsers}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            className="h-56"
          />
        </div>
      </DialogForm>
    </>
  )
}
