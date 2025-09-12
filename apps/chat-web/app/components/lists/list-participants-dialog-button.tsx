import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { ListParticipantsDialogButton_ListFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { UserPlusIcon } from '../../icons/user-plus-icon'
import { DialogForm } from '../dialog-form'
import { addListParticipants } from '../list-participations'
import { UsersSelector } from '../users-selector'
import { getListQueryOptions } from './get-list'
import { getListsQueryOptions } from './get-lists'

graphql(`
  fragment ListParticipantsDialogButton_List on AiList {
    id
    ownerId
    users {
      id
    }
  }
`)

interface ListParticipantsDialogFormProps {
  list: ListParticipantsDialogButton_ListFragment
  users: UserFragment[]
}

export const ListParticipantsDialogButton = ({ list, users }: ListParticipantsDialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assignableUsers = useMemo(
    () => users.filter((user) => !list.users.some((listUser) => listUser.id === user.id)),
    [users, list.users],
  )

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addListParticipants({
        data: { listId: list.id, userIds: selectedUserIds },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getListQueryOptions(list.id))
      await queryClient.invalidateQueries(getListsQueryOptions())

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
      <button
        type="button"
        className="btn btn-sm tooltip tooltip-left"
        onClick={handleOpen}
        data-tip={t('actions.add')}
        disabled={isPending}
      >
        <UserPlusIcon />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('texts.addParticipants')}
        description={t('lists.addParticipantsConfirmation')}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div className="h-64">
          <h4 className="underline">{t('lists.users')}</h4>
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
