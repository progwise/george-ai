import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { addAssistantParticipants } from '../../server-functions/assistantParticipations'
import { User } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { UsersSelector } from '../users-selector'

const AssistantParticipantsDialog_AssistantFragment = graphql(`
  fragment AssistantParticipantsDialog_Assistant on AiAssistant {
    id
    ownerId
    participants {
      id
    }
  }
`)

interface DialogFormProps {
  assistant: FragmentType<typeof AssistantParticipantsDialog_AssistantFragment>
  users: User[]
  userId: string
}

export const AssistantParticipantsDialog = (props: DialogFormProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assistant = useFragment(AssistantParticipantsDialog_AssistantFragment, props.assistant)
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
        <div>
          <h4 className="underline">{t('assistants.users')}</h4>
          <UsersSelector
            users={assignableUsers}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            className="h-64"
          />
        </div>
      </DialogForm>
    </>
  )
}
