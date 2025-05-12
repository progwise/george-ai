import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addLibraryParticipants } from '../../server-functions/libraryParticipations'
import { User } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'
import { getLibraryQueryOptions } from './get-library-query-options'

const LibraryParticipantsDialog_LibraryFragment = graphql(`
  fragment LibraryParticipantsDialog_Library on AiLibrary {
    id
    ownerId
    participants {
      id
    }
  }
`)

interface DialogFormProps {
  library: FragmentType<typeof LibraryParticipantsDialog_LibraryFragment>
  users: User[]
  userId: string
}

export const LibraryParticipantsDialog = (props: DialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const library = useFragment(LibraryParticipantsDialog_LibraryFragment, props.library)
  const { users } = props
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
      await queryClient.invalidateQueries(getLibraryQueryOptions(library.id, library.ownerId))
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.AiLibraries, props.userId],
      })

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
          />
        </div>
      </DialogForm>
    </>
  )
}
