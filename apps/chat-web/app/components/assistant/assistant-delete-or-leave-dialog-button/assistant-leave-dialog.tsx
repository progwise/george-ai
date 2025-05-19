import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { getAssignableAssistantsQueryOptions } from '../../../server-functions/assistant'
import { leaveAssistantParticipant } from '../../../server-functions/assistant-participations'
import { DialogForm } from '../../dialog-form'

const AssistantLeaveDialog_AssistantFragment = graphql(`
  fragment AssistantLeaveDialog_Assistant on AiAssistant {
    id
  }
`)

interface AssistantLeaveDialogProps {
  assistant: FragmentType<typeof AssistantLeaveDialog_AssistantFragment>
  userId: string
}

export const AssistantLeaveDialog = (props: AssistantLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const assistant = useFragment(AssistantLeaveDialog_AssistantFragment, props.assistant)

  const { mutate: leaveAssistantMutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveAssistantParticipant({
        data: {
          userId: props.userId,
          assistantId: assistant.id,
        },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssignableAssistantsQueryOptions(props.userId))
      navigate({ to: '..' })
    },
  })

  const handleSubmit = () => {
    leaveAssistantMutate()
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm tooltip"
        onClick={handleOpen}
        data-tip={t('assistants.leave')}
      >
        <ExitIcon />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('assistants.leave')}
        description={t('assistants.leaveConfirmation')}
        onSubmit={handleSubmit}
        submitButtonText={t('actions.leave')}
        disabledSubmit={isPending}
      />
    </>
  )
}
