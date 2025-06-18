import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { LibraryParticipantsDialogButton_LibraryFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { addLibraryParticipants } from '../../server-functions/library-participations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'

graphql(`
  fragment LibraryParticipantsDialogButton_Library on AiLibrary {
    id
    ownerId
    participants {
      id
    }
  }
`)

interface LibraryParticipantsDialogFormProps {
  library: LibraryParticipantsDialogButton_LibraryFragment
  users: UserFragment[]
}

export const LibraryParticipantsDialogButton = ({ library, users }: LibraryParticipantsDialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assignableUsers = useMemo(
    () => users.filter((user) => !library.participants.some((participant) => participant.id === user.id)),
    [users, library.participants],
  )

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addLibraryParticipants({
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
    addParticipants()
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button type="button" className="btn btn-neutral btn-sm" onClick={handleOpen}>
        {t('actions.add')} <PlusIcon />
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
