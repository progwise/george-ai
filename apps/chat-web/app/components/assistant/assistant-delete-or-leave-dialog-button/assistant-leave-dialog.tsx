import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { AssistantBaseFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { leaveAssistantParticipant } from '../../../server-functions/assistant-participations'
import { DialogForm } from '../../dialog-form'
import { getAiAssistantsQueryOptions } from '../get-assistants-query-options'

interface AssistantLeaveDialogProps {
  assistant: AssistantBaseFragment
}

export const AssistantLeaveDialog = ({ assistant }: AssistantLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveAssistantParticipant({
        data: {
          assistantId: assistant.id,
        },
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getAiAssistantsQueryOptions())
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
