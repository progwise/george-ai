import { useEffect, useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'

export const ParticipantsSelector_ConversationFragment = graphql(`
  fragment ParticipantsSelector_conversation on AiConversation {
    id
    participants {
      id
      name
      userId
      assistantId
    }
  }
`)

export const ParticipantsSelector_AssistantsFragment = graphql(`
  fragment ParticipantsSelector_Assistants on AiAssistant {
    id
  }
`)

export const ParticipantsSelector_HumansFragment = graphql(`
  fragment ParticipantsSelector_Humans on User {
    id
    username
  }
`)

interface ParticipantsSelectorProps {
  conversation?: FragmentType<typeof ParticipantsSelector_ConversationFragment>
  assistants: FragmentType<typeof ParticipantsSelector_AssistantsFragment>[] | null
  humans: FragmentType<typeof ParticipantsSelector_HumansFragment>[] | null
  onSubmit: (data: { assistantIds: string[]; userIds: string[] }) => void
  defaultChecked?: boolean
  isNewConversation?: boolean
  dialogRef?: React.RefObject<HTMLDialogElement | null>
}

export interface ParticipantSelectionData {
  assistantIds: string[]
  userIds: string[]
}

interface SelectionState {
  assistantIds: Record<string, boolean>
  userIds: Record<string, boolean>
}

export const ParticipantsSelector = (props: ParticipantsSelectorProps) => {
  const localDialogRef = useRef<HTMLDialogElement>(null)
  const dialogRef = props.dialogRef || localDialogRef
  const { t } = useTranslation()

  const conversation = useFragment(ParticipantsSelector_ConversationFragment, props.conversation)
  const assistants = useFragment(ParticipantsSelector_AssistantsFragment, props.assistants)
  const humans = useFragment(ParticipantsSelector_HumansFragment, props.humans)

  const existingParticipantIds = useMemo(
    () => conversation?.participants.map((participant) => participant.userId || participant.assistantId),
    [conversation?.participants],
  )

  const availableAssistants = useMemo(
    () =>
      props.isNewConversation
        ? assistants || []
        : assistants?.filter((assistant) => !existingParticipantIds?.includes(assistant.id)) || [],
    [assistants, existingParticipantIds, props.isNewConversation],
  )

  const availableHumans = useMemo(
    () =>
      props.isNewConversation
        ? humans || []
        : humans?.filter((user) => !existingParticipantIds?.includes(user.id)) || [],
    [humans, existingParticipantIds, props.isNewConversation],
  )

  const [selections, setSelections] = useState<SelectionState>({
    assistantIds: {},
    userIds: {},
  })

  useEffect(() => {
    const dialogElement = dialogRef.current
    if (dialogElement) {
      const resetSelections = () => {
        const defaultValue = props.isNewConversation || props.defaultChecked || true

        setSelections({
          assistantIds: Object.fromEntries(availableAssistants.map((a) => [a.id, defaultValue])),
          userIds: Object.fromEntries(availableHumans.map((u) => [u.id, defaultValue])),
        })
      }

      const originalShowModal = dialogElement.showModal
      dialogElement.showModal = function () {
        resetSelections()
        return originalShowModal.apply(this)
      }

      return () => {
        if (dialogElement) {
          dialogElement.showModal = originalShowModal
        }
      }
    }
  }, [dialogRef, availableAssistants, availableHumans, props.isNewConversation, props.defaultChecked])

  const handleCheckboxChange = (id: string, checked: boolean, type: 'assistants' | 'users') => {
    const stateKey = type === 'assistants' ? 'assistantIds' : 'userIds'
    setSelections((prev) => ({
      ...prev,
      [stateKey]: { ...prev[stateKey], [id]: checked },
    }))
  }

  const getSelectedIds = (selectionMap: Record<string, boolean>) =>
    Object.entries(selectionMap)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id)

  const getSelectedCount = () =>
    Object.values(selections.assistantIds).filter(Boolean).length +
    Object.values(selections.userIds).filter(Boolean).length

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const selectedAssistantIds = getSelectedIds(selections.assistantIds)
    const selectedUserIds = getSelectedIds(selections.userIds)

    if (selectedAssistantIds.length === 0 && selectedUserIds.length === 0) return

    props.onSubmit({ assistantIds: selectedAssistantIds, userIds: selectedUserIds })
  }

  const noParticipantsSelected = getSelectedCount() === 0

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

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{description}</p>
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="w-1/2">
              <h4 className="underline">{t('assistants')}</h4>
              {renderParticipantList(availableAssistants, 'assistants')}
            </div>
            <div className="w-1/2">
              <h4 className="underline">{t('users')}</h4>
              {renderParticipantList(availableHumans, 'users')}
            </div>
          </div>
          <div className="modal-action">
            <button type="button" className="btn btn-sm" onClick={() => dialogRef.current?.close()}>
              {t('actions.cancel')}
            </button>

            <div
              className={noParticipantsSelected ? 'lg:tooltip lg:tooltip-left' : ''}
              data-tip={t('tooltips.addNoParticipantsSelected')}
            >
              <button type="submit" className="btn btn-primary btn-sm" disabled={noParticipantsSelected}>
                {props.isNewConversation ? t('actions.create') : t('actions.add')}
              </button>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}
