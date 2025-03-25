import { useEffect, useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'

const ParticipantsDialog_ConversationFragment = graphql(`
  fragment ParticipantsDialog_Conversation on AiConversation {
    id
    participants {
      id
      userId
      assistantId
    }
  }
`)

const ParticipantsDialog_AssistantsFragment = graphql(`
  fragment ParticipantsDialog_Assistants on AiAssistant {
    id
  }
`)

const ParticipantsDialog_HumansFragment = graphql(`
  fragment ParticipantsDialog_Humans on User {
    id
    username
  }
`)

interface ParticipantsDialogProps {
  conversation?: FragmentType<typeof ParticipantsDialog_ConversationFragment>
  assistants: FragmentType<typeof ParticipantsDialog_AssistantsFragment>[]
  humans: FragmentType<typeof ParticipantsDialog_HumansFragment>[]
  onSubmit: (data: { assistantIds: string[]; userIds: string[] }) => void
  isNewConversation?: boolean
  dialogRef?: React.RefObject<HTMLDialogElement | null>
  isOpen?: boolean
}

export const ParticipantsDialog = (props: ParticipantsDialogProps) => {
  const localDialogRef = useRef<HTMLDialogElement>(null)
  const dialogRef = props.dialogRef || localDialogRef
  const { t } = useTranslation()
  const [hasChecked, setHasChecked] = useState(true)

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

  useEffect(() => {
    if (props.isOpen) {
      dialogRef.current?.showModal()
      const checkboxes = dialogRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      checkboxes?.forEach((checkbox) => {
        checkbox.checked = true
      })
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setHasChecked(true)
    }
  }, [props.isOpen, dialogRef])

  const handleSubmit = (formData: FormData) => {
    const assistantIds = Array.from(formData.getAll('assistantIds'))
    const userIds = Array.from(formData.getAll('userIds'))

    if (assistantIds.length === 0 && userIds.length === 0) return

    props.onSubmit({
      assistantIds: assistantIds as string[],
      userIds: userIds as string[],
    })
  }

  const handleCheckboxChange = () => {
    const checkboxes = dialogRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    const hasAnyChecked = checkboxes ? Array.from(checkboxes).some((checkbox) => checkbox.checked) : false

    setHasChecked(hasAnyChecked)
  }

  const renderParticipantList = (
    items: Array<{ id: string; name?: string | null; username?: string | null }>,
    type: 'assistants' | 'users',
  ) => {
    const emptyMessage = type === 'assistants' ? 'texts.noAssistantsAvailable' : 'texts.noUsersAvailable'

    if (items.length === 0) return <p>{t(emptyMessage)}</p>

    return items.map((item) => (
      <label key={item.id} className="label cursor-pointer justify-start gap-2">
        <input
          type="checkbox"
          name={type === 'assistants' ? 'assistantIds' : 'userIds'}
          value={item.id}
          className="checkbox-info checkbox"
          defaultChecked={true}
          onChange={handleCheckboxChange}
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
      disabledSubmit={!hasChecked}
      submitButtonText={submitButtonText}
      submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
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
