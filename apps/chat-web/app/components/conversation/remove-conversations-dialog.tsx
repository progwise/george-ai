import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { ConversationSelector_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { getConversationsQueryOptions, removeConversations } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'

interface RemoveConversationsDialogProps {
  conversations: ConversationSelector_ConversationFragment[]
  checkedConversationIds: string[]
  userId: string
  resetCheckedConversationIds: () => void
  selectedConversationId: string | undefined
}

export const RemoveConversationsDialog = (props: RemoveConversationsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const currentConversationIsChecked = props.checkedConversationIds.some((id) => id === props.selectedConversationId)

  const { mutate: removeConversationsMutate, isPending: isRemovePending } = useMutation({
    mutationFn: () =>
      removeConversations({
        data: { conversationIds: props.checkedConversationIds, userId: props.userId },
      }),
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationsQueryOptions(props.userId))
      props.resetCheckedConversationIds()
      if (currentConversationIsChecked) {
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

  const trashIconDesign = props.checkedConversationIds.length < 1 ? 'size-6 text-neutral-content' : 'size-6 text-error'

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square lg:tooltip lg:tooltip-right z-60 relative mx-1"
        onClick={handleOpen}
        data-tip={buttonTooltip}
        disabled={props.checkedConversationIds.length < 1}
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
          {props.checkedConversationIds.length} {t('texts.numberOfConversationsToRemove')}
        </div>
      </DialogForm>
    </>
  )
}
