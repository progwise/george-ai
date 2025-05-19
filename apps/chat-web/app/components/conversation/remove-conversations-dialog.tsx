import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useRef } from 'react'

import { FragmentType } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { getConversationsQueryOptions, removeConversations } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { ConversationSelector_ConversationFragment } from './conversation-selector'

interface RemoveConversationsDialogProps {
  conversations: FragmentType<typeof ConversationSelector_ConversationFragment>[] | null
  selectedConversationIds: string[]
  userId: string
  resetSelectedConversationIds: () => void
}

export const RemoveConversationsDialog = (props: RemoveConversationsDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { conversationId } = useParams({ strict: false })

  const displayedConversationIsSelected = !!conversationId && props.selectedConversationIds.includes(conversationId)

  const { mutate: removeConversationsMutate, isPending: isRemovePending } = useMutation({
    mutationFn: () =>
      removeConversations({
        data: { conversationIds: props.selectedConversationIds, userId: props.userId },
      }),
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationsQueryOptions(props.userId))
      props.resetSelectedConversationIds()
      if (displayedConversationIsSelected) {
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

  return (
    <>
      <button type="button" className="btn btn-neutral btn-square" onClick={handleOpen} title={buttonTooltip}>
        <TrashIcon />
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
