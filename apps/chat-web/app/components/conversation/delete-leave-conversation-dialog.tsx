import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { LeaveIcon } from '../../icons/leave-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { deleteConversation, leaveConversation } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'

const ConversationDelete_ConversationFragment = graphql(`
  fragment ConversationDelete_Conversation on AiConversation {
    id
    ownerId
    createdAt
    assistants {
      name
    }
    participants {
      id
      userId
    }
  }
`)

interface DeleteLeaveConversationDialogProps {
  conversation: FragmentType<typeof ConversationDelete_ConversationFragment>
}

export const DeleteLeaveConversationDialog = (props: DeleteLeaveConversationDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const authContext = useAuth()
  const user = authContext.user

  const conversation = useFragment(ConversationDelete_ConversationFragment, props.conversation)

  const isOwner = user?.id === conversation.ownerId
  const userParticipant = user?.id
    ? conversation.participants.find((participant) => participant.userId === user.id)
    : null
  const isParticipant = !!userParticipant

  const { mutate: deleteConversationMutate, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      return await deleteConversation({
        data: { conversationId: conversation.id },
      })
    },
    onSettled: async () => {
      if (!user?.id) return

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, user.id],
      })
      navigate({ to: '..' })
    },
  })

  const { mutate: leaveConversationMutate, isPending: isLeavePending } = useMutation({
    mutationFn: async () => {
      if (!userParticipant) throw new Error('Participant not found')
      return await leaveConversation({
        data: {
          userId: userParticipant.id,
        },
      })
    },
    onSettled: async () => {
      if (!user?.id) return

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, user.id],
      })
      navigate({ to: '..' })
    },
  })

  const handleSubmit = () => {
    if (isOwner) {
      deleteConversationMutate()
    } else if (isParticipant) {
      leaveConversationMutate()
    }
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  if (!user?.id) {
    return null
  }

  const isPending = isDeletePending || isLeavePending
  const Icon = isOwner ? TrashIcon : LeaveIcon

  const title = isOwner ? t('texts.deleteConversation') : t('texts.leaveConversation')
  const description = isOwner ? t('texts.deleteConversationConfirmation') : t('texts.leaveConversationConfirmation')
  const submitButtonText = isOwner ? t('actions.delete') : t('actions.leave')
  const buttonTooltip = isOwner ? t('tooltips.deleteConversation') : t('tooltips.leaveConversation')

  return (
    <>
      <button
        type="button"
        className="btn btn-square btn-ghost btn-sm lg:tooltip"
        onClick={handleOpen}
        data-tip={buttonTooltip}
      >
        <Icon className="size-6" />
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        submitButtonText={submitButtonText}
      >
        <div className="w-full">
          <div className="mb-4">
            <time className="text-nowrap font-medium">
              {new Date(conversation.createdAt).toLocaleString().replace(',', '')}
            </time>{' '}
            {t('texts.with')}{' '}
            <span className="font-medium">
              {conversation.assistants?.map((assistant) => assistant.name).join(', ')}
            </span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
