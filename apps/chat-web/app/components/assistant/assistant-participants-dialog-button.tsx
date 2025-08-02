import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { AssistantParticipantsDialogButton_AssistantFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { addAssistantParticipants } from '../../server-functions/assistant-participations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'
import { getAssistantQueryOptions } from './get-assistant'

graphql(`
  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {
    id
    ownerId
    users {
      id
    }
  }
`)

interface AssistantParticipantsDialogButtonProps {
  assistant: AssistantParticipantsDialogButton_AssistantFragment
  users: UserFragment[]
}

export const AssistantParticipantsDialogButton = ({ assistant, users }: AssistantParticipantsDialogButtonProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assignableUsers = useMemo(
    () => users.filter((user) => !assistant.users.some((assistantUser) => assistantUser.id === user.id)),
    [users, assistant.users],
  )

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addAssistantParticipants({
        data: { assistantId: assistant.id, userIds: selectedUserIds },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id))

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
        description={t('assistants.addParticipantsConfirmation')}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div>
          <h4 className="underline">{t('assistants.users')}</h4>
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
