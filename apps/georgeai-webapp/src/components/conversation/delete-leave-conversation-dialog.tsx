import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { dateString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ConversationDelete_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ExitIcon } from '../../icons/exit-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { deleteConversation, leaveConversation } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { LoadingSpinner } from '../loading-spinner'
import { getConversationsQueryOptions } from './get-conversations'

graphql(`
  fragment ConversationDelete_Conversation on AiConversation {
    ...ConversationBase
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
  conversation: ConversationDelete_ConversationFragment
  userId: string
}

export const DeleteLeaveConversationDialog = ({ conversation, userId }: DeleteLeaveConversationDialogProps) => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const isOwner = userId === conversation.ownerId
  const userParticipant = userId ? conversation.participants.find((participant) => participant.userId === userId) : null
  const isParticipant = !!userParticipant

  const { mutate: deleteConversationMutate, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      return await deleteConversation({
        data: { conversationId: conversation.id },
      })
    },
    onSettled: async () => {
      dialogRef.current?.close()
      await queryClient.invalidateQueries(getConversationsQueryOptions())
      navigate({ to: '..' })
    },
  })

  const { mutate: leaveConversationMutate, isPending: isLeavePending } = useMutation({
    mutationFn: async () => {
      if (!userParticipant) throw new Error('Participant not found')
      return await leaveConversation({
        data: {
          participantId: userParticipant.id,
        },
      })
    },
    onSettled: async () => {
      dialogRef.current?.close()
      await queryClient.invalidateQueries(getConversationsQueryOptions())
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

  const isPending = isDeletePending || isLeavePending
  const Icon = isOwner ? TrashIcon : ExitIcon

  const title = `${isOwner ? t('conversations.deleteConversation') : t('conversations.leave')} (${dateString(conversation.createdAt, language)})`
  const description = isOwner ? t('conversations.deleteConfirmation') : t('conversations.leaveConfirmation')
  const submitButtonText = isOwner ? t('actions.delete') : t('actions.leave')

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => dialogRef.current?.showModal()}>
        <div className="flex items-center gap-2">
          <Icon className="size-6" />
          <span>{isOwner ? t('actions.delete') : t('actions.leave')}</span>
        </div>
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
            {conversation.assistants.length > 0 && (
              <>
                {t('texts.with')}{' '}
                <span className="font-medium">
                  {conversation.assistants.map((assistant) => assistant.name).join(', ')}
                </span>
              </>
            )}
          </div>
        </div>
      </DialogForm>
    </>
  )
}
