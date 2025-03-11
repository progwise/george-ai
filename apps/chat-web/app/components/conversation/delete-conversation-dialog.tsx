import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { deleteConversation } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'

const ConversationDelete_ConversationFragment = graphql(`
  fragment ConversationDelete_conversation on AiConversation {
    id
    createdAt
    assistants {
      name
    }
  }
`)

interface DeleteConversationDialogProps {
  conversation: FragmentType<typeof ConversationDelete_ConversationFragment>
}

export const DeleteConversationDialog = (props: DeleteConversationDialogProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t, language } = useTranslation()

  const conversation = useFragment(ConversationDelete_ConversationFragment, props.conversation)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      deleteConversation({ data: { conversationId: conversation.id } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['conversations', auth.user?.id],
      })
      navigate({ to: '..' })
    },
  })

  const dialogReference = useRef<HTMLDialogElement>(null)

  const handleDeleteConversation = async () => {
    await mutate()
    dialogReference.current?.close()
  }

  if (!language) {
    return <LoadingSpinner isLoading={true} message={t('actions.loading')} />
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-square btn-ghost btn-sm lg:tooltip"
        onClick={() => dialogReference.current?.showModal()}
        data-tip="Delete Conversation"
      >
        <TrashIcon className="size-6" />
      </button>
      <dialog ref={dialogReference} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            <span>{t('texts.deleteConversation')}</span> <br />
            <time className="text-nowrap">{new Date(conversation.createdAt).toLocaleString().replace(',', '')}</time>
            {' with '}
            <span>{conversation.assistants?.map((assistant) => assistant.name).join(',')}</span>
          </h3>
          <p className="py-4">You are about to delete this conversation. It cannot be restored. Please confirm.</p>
          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-sm">
                Cancel
              </button>
            </form>
            <button
              type="submit"
              className="btn btn-error btn-sm"
              disabled={isPending}
              onClick={handleDeleteConversation}
            >
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">cancel</button>
        </form>
      </dialog>
    </>
  )
}
