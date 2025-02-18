import { RefObject } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteConversation } from '../../server-functions/conversations'
import { useAuth } from '../../auth/auth-context'
import { useNavigate } from '@tanstack/react-router'
import { FragmentType, graphql, useFragment } from '../../gql'

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
  ref: RefObject<HTMLDialogElement | null>
}

export const DeleteConversationDialog = (
  props: DeleteConversationDialogProps,
) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { ref } = props
  const conversation = useFragment(
    ConversationDelete_ConversationFragment,
    props.conversation,
  )

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      deleteConversation({ data: { conversationId: conversation.id } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['conversations', auth.user?.id],
      })
      ref.current?.close()
      navigate({ to: '..' })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    mutate()
  }

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          <span>Delete conversation</span> <br />
          <time className="text-nowrap">
            {new Date(conversation.createdAt).toLocaleString().replace(',', '')}
          </time>
          {' with '}
          <span>
            {conversation.assistants
              ?.map((assistant) => assistant.name)
              .join(',') || 'Unknown'}
          </span>
        </h3>
        <p className="py-4">
          You are about to delete this conversation. It cannot be restored.
          Please confirm.
        </p>
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => ref.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={isPending}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
