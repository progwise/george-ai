import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addAssistantParticipants } from '../../server-functions/assistantParticipations'
import { User } from '../../server-functions/users'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
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

  const assignedUserIds = useMemo(
    () =>
      (assistant.participants
        .filter((participant) => participant.id)
        .map((participant) => participant.id) as string[]) || [],
    [assistant],
  )

  const availableParticipants = useMemo(() => {
    if (!users || !participantsFilter || participantsFilter.length < 2) {
      setSelectedParticipantIds([])
      return []
    }

    const filter = participantsFilter.toLowerCase()
    const list = users.filter(
      (participant) =>
        !assignedUserIds?.includes(participant.id) &&
        (participant.username.toLowerCase().includes(filter) ||
          participant.email.toLowerCase().includes(filter) ||
          (participant.profile?.firstName && participant.profile.firstName.toLowerCase().includes(filter)) ||
          (participant.profile?.lastName && participant.profile.lastName.toLowerCase().includes(filter)) ||
          (participant.profile?.business && participant.profile.business.toLowerCase().includes(filter)) ||
          (participant.profile?.position && participant.profile.position.toLowerCase().includes(filter))),
    )
    setSelectedParticipantIds((prev) => prev.filter((id) => list.some((participant) => participant.id === id)))
    return list
  }, [users, assignedUserIds, participantsFilter])

  const isOwner = props.userId === assistant.ownerId

  const { mutate: addParticipants, isPending } = useMutation({
    mutationFn: async () => {
      if (!isOwner) {
        throw new Error('Only the owner can add participants')
      }
      return await addAssistantParticipants({
        data: { assistantId: assistant.id, userIds: selectedParticipantIds },
      })
    },
    onSettled: async () => {
      if (!assistant) return

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.AiAssistant, assistant.id],
      })
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
      <button type="button" className="btn btn-sm" onClick={handleOpen}>
        {t('actions.add')} <PlusIcon />
      </button>

      <LoadingSpinner isLoading={isPending} />
      <DialogForm
        ref={dialogRef}
        title="Manage assistant participants here." //todo: localization
        description={t('texts.addParticipantsConfirmation')} //todo: address mentions conversation
        onSubmit={handleSubmit}
        disabledSubmit={selectedParticipantIds.length < 1}
        submitButtonText={t('actions.add')}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')} //todo: related to conversation
      >
        <div className="flex w-full gap-2">
          <div className="w-1/2">
            <h4 className="underline">{t('conversations.humans')}</h4>

            <Input
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
        </div>
      </DialogForm>
    </>
  )
}
