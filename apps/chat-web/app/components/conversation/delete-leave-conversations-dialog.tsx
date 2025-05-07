import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { FragmentType } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { removeConversations } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { ConversationSelector_ConversationFragment } from './conversation-selector'

interface DeleteLeaveConversationsDialogProps {
  conversations: FragmentType<typeof ConversationSelector_ConversationFragment>[] | null
  selectedConversationIds: string[]
  userId: string
  resetSelectedConversationIds: () => void
  selectedConversationId: string | undefined
}

export const DeleteLeaveConversationsDialog = (props: DeleteLeaveConversationsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openConversationIsChecked = !!(props.selectedConversationId
    ? props.selectedConversationIds.find((id) => id === props.selectedConversationId)
    : null)

  const { mutate: removeConversationsMutate, isPending: isRemovePending } = useMutation({
    mutationFn: async () => {
      return await removeConversations({
        data: { conversationIds: props.selectedConversationIds, userId: props.userId },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, props.userId],
      })
      props.resetSelectedConversationIds()
      if (openConversationIsChecked) {
        navigate({ to: '..' })
      }
      dialogRef.current?.close()
    },
  })

  const handleSubmit = () => {
    removeConversationsMutate()
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  const title = t('conversations.removeMultiple')
  const description = t('conversations.removeMultipleConfirmation')
  const submitButtonText = t('actions.remove')
  const buttonTooltip = t('conversations.removeMultiple')

  const trashIconDesign = props.selectedConversationIds.length < 1 ? 'size-6 stroke-neutral-content' : 'size-6'

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square lg:tooltip lg:tooltip-right z-60 relative mx-1"
        onClick={handleOpen}
        data-tip={buttonTooltip}
        disabled={props.selectedConversationIds.length < 1}
      >
        <TrashIcon className={trashIconDesign} />
      </button>

      <LoadingSpinner isLoading={isRemovePending} />

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        submitButtonText={submitButtonText}
      >
        <div>
          {props.selectedConversationIds.length} {t('texts.numberOfConversationsToRemove')}
        </div>
      </DialogForm>
    </>
  )
}
