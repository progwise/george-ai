import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { addAssistantParticipants } from '../../server-functions/assistant-participations'
import { User } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'

const AssistantParticipantsDialogButton_AssistantFragment = graphql(`
  fragment AssistantParticipantsDialogButton_Assistant on AiAssistant {
    id
    ownerId
    participants {
      id
    }
  }
`)

interface AssistantParticipantsDialogFormProps {
  assistant: FragmentType<typeof AssistantParticipantsDialogButton_AssistantFragment>
  users: User[]
  userId: string
}

export const AssistantParticipantsDialogButton = (props: AssistantParticipantsDialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assistant = useFragment(AssistantParticipantsDialogButton_AssistantFragment, props.assistant)
  const { users } = props
  const assignableUsers = useMemo(
    () => users.filter((user) => !assistant.participants.some((participant) => participant.id === user.id)),
    [users, assistant.participants],
  )

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addAssistantParticipants({
        data: { assistantId: assistant.id, userIds: selectedUserIds, currentUserId: props.userId },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId))

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
        <div className="h-64">
          <h4 className="underline">{t('assistants.users')}</h4>
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
