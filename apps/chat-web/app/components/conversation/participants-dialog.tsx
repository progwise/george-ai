import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'

export const ParticipantsDialog_ConversationFragment = graphql(`
  fragment ParticipantsDialog_conversation on AiConversation {
    id
    participants {
      id
      name
      userId
      assistantId
    }
  }
`)

export const ParticipantsDialog_AssistantsFragment = graphql(`
  fragment ParticipantsDialog_Assistants on AiAssistant {
    id
  }
`)

export const ParticipantsDialog_HumansFragment = graphql(`
  fragment ParticipantsDialog_Humans on User {
    id
    username
  }
`)

interface ParticipantsDialogProps {
  conversation?: FragmentType<typeof ParticipantsDialog_ConversationFragment>
  assistants: FragmentType<typeof ParticipantsDialog_AssistantsFragment>[] | null
  humans: FragmentType<typeof ParticipantsDialog_HumansFragment>[] | null
  onSubmit: (data: { assistantIds: string[]; userIds: string[] }) => void
  isNewConversation?: boolean
  dialogRef?: React.RefObject<HTMLDialogElement | null>
  isOpen?: boolean
}

export const ParticipantsDialog = (props: ParticipantsDialogProps) => {
  const localDialogRef = useRef<HTMLDialogElement>(null)
  const dialogRef = props.dialogRef || localDialogRef
  const { t } = useTranslation()

  const conversation = useFragment(ParticipantsDialog_ConversationFragment, props.conversation)
  const assistants = useFragment(ParticipantsDialog_AssistantsFragment, props.assistants)
  const humans = useFragment(ParticipantsDialog_HumansFragment, props.humans)

  const existingParticipantIds = conversation?.participants.map(
    (participant) => participant.userId || participant.assistantId,
  )

  const availableAssistants = useMemo(
    () =>
      props.isNewConversation
        ? assistants || []
        : assistants?.filter((assistant) => !existingParticipantIds?.includes(assistant.id)) || [],
    [props.isNewConversation, assistants, existingParticipantIds],
  )

  const availableHumans = useMemo(
    () =>
      props.isNewConversation
        ? humans || []
        : humans?.filter((user) => !existingParticipantIds?.includes(user.id)) || [],
    [props.isNewConversation, humans, existingParticipantIds],
  )

  const [selections, setSelections] = useState<{
    assistantIds: Record<string, boolean>
    userIds: Record<string, boolean>
  }>({
    assistantIds: {},
    userIds: {},
  })

  const initializeSelections = useCallback(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setSelections({
      assistantIds: Object.fromEntries(availableAssistants.map((a) => [a.id, true])),
      userIds: Object.fromEntries(availableHumans.map((h) => [h.id, true])),
    })
  }, [availableAssistants, availableHumans])

  useEffect(() => {
    if (props.isOpen) {
      initializeSelections()
      dialogRef.current?.showModal()
    }
  }, [props.isOpen, initializeSelections, dialogRef])

  useEffect(() => {
    const dialogElement = dialogRef.current
    if (dialogElement) {
      const originalShowModal = dialogElement.showModal
      dialogElement.showModal = function () {
        initializeSelections()
        return originalShowModal.apply(this)
      }

      return () => {
        if (dialogElement) {
          dialogElement.showModal = originalShowModal
        }
      }
    }
  }, [dialogRef, initializeSelections])

  const handleCheckboxChange = (id: string, checked: boolean, type: 'assistants' | 'users') => {
    const stateKey = type === 'assistants' ? 'assistantIds' : 'userIds'
    setSelections((prev) => ({
      ...prev,
      [stateKey]: { ...prev[stateKey], [id]: checked },
    }))
  }

  const getSelectedCount = () =>
    Object.values(selections.assistantIds).filter(Boolean).length +
    Object.values(selections.userIds).filter(Boolean).length

  const noParticipantsSelected = getSelectedCount() === 0

  const handleSubmit = () => {
    const selectedAssistantIds = Object.entries(selections.assistantIds)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id)

    const selectedUserIds = Object.entries(selections.userIds)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id)

    if (selectedAssistantIds.length === 0 && selectedUserIds.length === 0) return

    props.onSubmit({ assistantIds: selectedAssistantIds, userIds: selectedUserIds })
  }

  const renderParticipantList = (
    items: Array<{ id: string; name?: string | null; username?: string | null }>,
    type: 'assistants' | 'users',
  ) => {
    const selectionMap = type === 'assistants' ? selections.assistantIds : selections.userIds
    const emptyMessage = type === 'assistants' ? 'texts.noAssistantsAvailable' : 'texts.noUsersAvailable'

    if (items.length === 0) return <p>{t(emptyMessage)}</p>

    return items.map((item) => (
      <label key={item.id} className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          value={item.id}
          checked={!!selectionMap[item.id]}
          className="checkbox-info checkbox"
          onChange={(e) => handleCheckboxChange(item.id, e.target.checked, type)}
        />
        <span className="label-text">{type === 'assistants' ? item.name : item.name || item.username}</span>
      </label>
    ))
  }

  const title = props.isNewConversation ? t('texts.newConversation') : t('texts.addParticipants')
  const description = props.isNewConversation
    ? t('texts.newConversationConfirmation')
    : t('texts.addParticipantsConfirmation')
  const submitButtonText = props.isNewConversation ? t('actions.create') : t('actions.add')

  return (
    <DialogForm
      ref={dialogRef}
      title={title}
      description={description}
      onSubmit={handleSubmit}
      disabledSubmit={noParticipantsSelected}
      submitButtonText={submitButtonText}
    >
      <div className="flex w-full gap-2">
        <div className="w-1/2">
          <h4 className="underline">{t('conversations.assistants')}</h4>
          {renderParticipantList(availableAssistants, 'assistants')}
        </div>
        <div className="w-1/2">
          <h4 className="underline">{t('conversations.humans')}</h4>
          {renderParticipantList(availableHumans, 'users')}
        </div>
      </div>
    </DialogForm>
  )
}
