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
  const [userSearch, setUserSearch] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const library = useFragment(LibraryParticipantsDialog_LibraryFragment, props.library)
  const { users } = props

  const assignedUserIds = useMemo(() => library.participants.map((participant) => participant.id), [library])

  const displayedUsers = useMemo(() => {
    const search = userSearch.toLowerCase()
    const list = users.filter((user) => {
      const isNotParticipant = !assignedUserIds.includes(user.id)
      const isCurrentlySelected = selectedUserIds.includes(user.id)

      // only search if the user has typed at least 2 characters
      const isSearchEnabled = userSearch.length >= 2
      const isSearchMatching: boolean =
        isSearchEnabled &&
        (user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.profile?.firstName?.toLowerCase().includes(search) ||
          user.profile?.lastName?.toLowerCase().includes(search) ||
          user.profile?.business?.toLowerCase().includes(search) ||
          user.profile?.position?.toLowerCase().includes(search) ||
          false)

      return isNotParticipant && (isCurrentlySelected || isSearchMatching)
    })
    return list
  }, [users, assignedUserIds, userSearch, selectedUserIds])

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

  const allDisplayedUserSelected = displayedUsers.length === selectedUserIds.length

  return (
    <>
      <button type="button" className="btn btn-neutral btn-sm" onClick={handleOpen}>
        {t('actions.add')} <PlusIcon />
      </button>

      <LoadingSpinner isLoading={isPending} />
      <DialogForm
        ref={dialogRef}
        title={t('texts.addParticipants')}
        // add localization
        description={t('assistants.addParticipantsConfirmation')}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        {/* add localization */}
        <h4 className="underline">{t('assistants.users')}</h4>

        <input
          type="text"
          onChange={(event) => setUserSearch(event.currentTarget.value)}
          name="userSearch"
          placeholder={t('placeholders.searchUsers')}
          className="input"
        />
        <label className="label cursor-pointer justify-start gap-2">
          <input
            disabled={displayedUsers.length < 1}
            type="checkbox"
            name="selectAll"
            className="checkbox-primary checkbox checkbox-sm"
            checked={selectedUserIds.length > 0}
            ref={(element) => {
              if (!element) return

              element.indeterminate = selectedUserIds.length > 0 && !allDisplayedUserSelected
            }}
            onChange={() => {
              if (allDisplayedUserSelected) {
                setSelectedUserIds([])
              } else {
                setSelectedUserIds(displayedUsers.map((user) => user.id))
              }
            }}
          />

          {displayedUsers.length < 1 ? (
            <span className="info label-text font-bold">{t('texts.noUsersFound')}</span>
          ) : (
            <span className="info label-text font-bold">{`${displayedUsers.length} ${t('texts.usersFound')}`}</span>
          )}
        </label>

        <div className="h-48 w-full overflow-y-scroll">
          {displayedUsers.map((user) => (
            <label key={user.id} className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="userIds"
                value={user.id}
                className="checkbox-info checkbox checkbox-sm"
                checked={selectedUserIds.includes(user.id)}
                onChange={(event) => {
                  const value = event.target.checked
                  if (value) {
                    setSelectedUserIds((prev) => [...prev, user.id])
                  } else {
                    setSelectedUserIds((prev) => prev.filter((id) => id !== user.id))
                  }
                }}
              />
              <span className="label-text">
                {user.username} ({user.email}
                {user.profile && `| ${user.profile.business}`})
              </span>
            </label>
          ))}
        </div>
      </DialogForm>
    </>
  )
}
