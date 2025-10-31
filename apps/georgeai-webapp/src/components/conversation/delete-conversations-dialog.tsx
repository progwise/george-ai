import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { deleteConversations } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { getConversationsQueryOptions } from './get-conversations'

interface DeleteConversationsDialogProps {
  checkedConversationIds: string[]
  resetCheckedConversationIds: () => void
  selectedConversationId: string | undefined
}

export const DeleteConversationsDialog = (props: DeleteConversationsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const currentConversationIsChecked = props.checkedConversationIds.some((id) => id === props.selectedConversationId)

  const { mutate: deleteConversationsMutate, isPending: isDeletePending } = useMutation({
    mutationFn: () =>
      deleteConversations({
        data: { conversationIds: props.checkedConversationIds },
      }),
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationsQueryOptions())
      props.resetCheckedConversationIds()
      if (currentConversationIsChecked) {
        navigate({ to: '..' })
      }
      dialogRef.current?.close()
    },
  })

  const handleSubmit = () => {
    deleteConversationsMutate()
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  const title = t('conversations.removeMultiple')
  const description = t('conversations.removeMultipleConfirmation')
  const submitButtonText = t('actions.remove')
  const buttonTooltip = t('conversations.removeMultiple')

  const hasCheckedConversationIds = props.checkedConversationIds.length < 1

  return (
    <>
      <button
        type="button"
        className={twMerge('btn btn-ghost btn-sm', hasCheckedConversationIds && 'text-neutral-content')}
        onClick={handleOpen}
        data-tip={buttonTooltip}
        disabled={hasCheckedConversationIds}
      >
        <div className="flex items-center gap-2">
          <TrashIcon className="size-6" />
          {t('actions.deleteSelected')}
        </div>
      </button>

      <LoadingSpinner isLoading={isDeletePending} />

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        submitButtonText={submitButtonText}
      >
        <div>
          {props.checkedConversationIds.length} {t('texts.numberOfConversationsToRemove')}
        </div>
      </DialogForm>
    </>
  )
}
