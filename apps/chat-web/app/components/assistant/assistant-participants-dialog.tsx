import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { addAssistantParticipants } from '../../server-functions/assistantParticipations'
import { User } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'

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
  const [participantsFilter, setParticipantsFilter] = useState<string | null>(null)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const assistant = useFragment(AssistantParticipantsDialog_AssistantFragment, props.assistant)
  const { users } = props

  const assignedUserIds = useMemo(() => assistant.participants.map((participant) => participant.id), [assistant])

  const availableParticipants = useMemo(() => {
    if (!participantsFilter || participantsFilter.length < 2) {
      return []
    }

    const filter = participantsFilter.toLowerCase()
    const list = users.filter(
      (participant) =>
        !assignedUserIds.includes(participant.id) &&
        (participant.username.toLowerCase().includes(filter) ||
          participant.email.toLowerCase().includes(filter) ||
          (participant.profile?.firstName && participant.profile.firstName.toLowerCase().includes(filter)) ||
          (participant.profile?.lastName && participant.profile.lastName.toLowerCase().includes(filter)) ||
          (participant.profile?.business && participant.profile.business.toLowerCase().includes(filter)) ||
          (participant.profile?.position && participant.profile.position.toLowerCase().includes(filter))),
    )
    return list
  }, [users, assignedUserIds, participantsFilter])

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      return await addAssistantParticipants({
        data: { assistantId: assistant.id, userIds: selectedParticipantIds },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId))
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.AiAssistants, props.userId],
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
        description={t('assistants.addParticipantsConfirmation')}
        onSubmit={handleSubmit}
        disabledSubmit={selectedParticipantIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div className="w-1/2">
          <h4 className="underline">{t('assistants.users')}</h4>

          <input
            type="text"
            onChange={(event) => setParticipantsFilter(event.currentTarget.value)}
            name={'userFilter'}
            placeholder={t('placeholders.searchUsers')}
          />
          <label className="label cursor-pointer justify-start gap-2">
            <input
              disabled={availableParticipants.length < 1}
              type="checkbox"
              name="selectAll"
              className="checkbox-primary checkbox checkbox-sm"
              checked={selectedParticipantIds.length > 0}
              ref={(element) => {
                if (!element) return
                element.indeterminate =
                  selectedParticipantIds.length > 0 && selectedParticipantIds.length < availableParticipants.length
              }}
              onChange={(event) => {
                const value = event.target.checked
                if (value) {
                  setSelectedParticipantIds(availableParticipants.map((human) => human.id))
                } else {
                  setSelectedParticipantIds([])
                }
              }}
            />

            {availableParticipants.length < 1 ? (
              <span className="info label-text font-bold">{t('texts.noUsersFound')}</span>
            ) : (
              <span className="info label-text font-bold">{`${availableParticipants.length} ${t('texts.usersFound')}`}</span>
            )}
          </label>

          <div className="h-48 overflow-y-scroll">
            {availableParticipants.map((participant) => (
              <label key={participant.id} className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="userIds"
                  value={participant.id}
                  className="checkbox-info checkbox checkbox-sm"
                  checked={selectedParticipantIds.includes(participant.id)}
                  onChange={(event) => {
                    const value = event.target.checked
                    if (value) {
                      setSelectedParticipantIds((prev) => [...prev, participant.id])
                    } else {
                      setSelectedParticipantIds((prev) => prev.filter((id) => id !== participant.id))
                    }
                  }}
                />
                <span className="label-text">
                  {`${participant.username} (${participant.email} ${participant.profile ? '| ' + participant.profile?.business : ''} )`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </DialogForm>
    </>
  )
}
