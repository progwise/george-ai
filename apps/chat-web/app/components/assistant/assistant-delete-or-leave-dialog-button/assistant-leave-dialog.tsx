import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { AssistantBaseFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'
import { leaveAssistantParticipant } from '../../../server-functions/assistant-participations'
import { DialogForm } from '../../dialog-form'

interface AssistantLeaveDialogProps {
  assistant: AssistantBaseFragment
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
      queryClient.invalidateQueries(getAiAssistantsQueryOptions(userId))
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
