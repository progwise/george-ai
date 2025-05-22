import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { AssistantParticipantsDialogButton_AssistantFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { addAssistantParticipants } from '../../server-functions/assistant-participations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'

graphql(`
  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {
    id
    ownerId
    participants {
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
  const router = useRouter()

  const dialogRef = useRef<HTMLDialogElement>(null)

  const assignableUsers = useMemo(
    () => users.filter((user) => !assistant.participants.some((participant) => participant.id === user.id)),
    [users, assistant.participants],
  )

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addAssistantParticipants({
        data: { assistantId: assistant.id, userIds: selectedUserIds },
      })
    },
    onSettled: async () => {
      router.invalidate()

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
