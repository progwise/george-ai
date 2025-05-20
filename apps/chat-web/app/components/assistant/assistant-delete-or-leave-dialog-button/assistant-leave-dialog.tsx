import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { AssistantLeaveDialog_AssistantFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { queryKeys } from '../../../query-keys'
import { leaveAssistantParticipant } from '../../../server-functions/assistant-participations'
import { DialogForm } from '../../dialog-form'

graphql(`
  fragment AssistantLeaveDialog_Assistant on AiAssistant {
    id
  }
`)

interface AssistantLeaveDialogProps {
  assistant: AssistantLeaveDialog_AssistantFragment
  userId: string
}

export const AssistantLeaveDialog = ({ assistant, userId }: AssistantLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveAssistantParticipant({
        data: {
          userId,
          assistantId: assistant.id,
        },
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistants, userId] })
      dialogRef.current?.close()
    },
  })

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm tooltip tooltip-right"
        onClick={() => {
          dialogRef.current?.showModal()
        }}
        data-tip={t('assistants.leave')}
      >
        <ExitIcon />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('assistants.leave')}
        description={t('assistants.leaveConfirmation')}
        onSubmit={() => {
          mutate()
        }}
        submitButtonText={t('actions.leave')}
        disabledSubmit={isPending}
      />
    </>
  )
}
