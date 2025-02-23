import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '../../server-functions/conversations'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useAuth } from '../../auth/auth-context'

const ConversationForm_ConversationFragment = graphql(`
  fragment ConversationForm_conversation on AiConversation {
    id
    assistants {
      id
      name
    }
  }
`)

interface ConversationFormProps {
  conversation: FragmentType<typeof ConversationForm_ConversationFragment>
}
export const ConversationForm = (props: ConversationFormProps) => {
  const conversation = useFragment(
    ConversationForm_ConversationFragment,
    props.conversation,
  )
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: {
      content: string
      recipientAssistantIds: string[]
    }) => {
      if (!user) {
        throw new Error('User not set')
      }
      if (!data.content || data.content.trim().length < 3) {
        throw new Error('Message must be at least 3 characters')
      }
      const result = await sendMessage({
        data: {
          userId: user.id,
          conversationId: conversation.id!,
          ...data,
        },
      })
      return result
    },
    onSettled: () => {
      // refetch the conversation to get the new message
      queryClient.invalidateQueries(['conversation', conversation.id])
    },
  })
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const content = formData.get('message') as string
    const recipientAssistantIds = Array.from(formData.getAll('assistants')).map(
      (formData) => formData.toString(),
    )

    form.reset()

    mutate({ content, recipientAssistantIds })
  }

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      event.currentTarget.form?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    }
  }

  if (!user) {
    return <h3>Login to send messages</h3>
  }

  return (
    <div className="card bg-base-350 text-base-content shadow-md border border-base-300 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-content rounded-full">
          {' '}
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {user.name || user.username}
          </span>
          <span className="text-xs opacity-60">
            {new Date(Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ·{' '}
            {new Date(Date.now()).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Type your message"
          rows={2}
          name="message"
          disabled={isPending}
          onKeyDown={handleTextareaKeyDown}
        ></textarea>
        <div className="flex gap-2 items-center">
          {conversation.assistants?.map((assistant) => (
            <label key={assistant.id} className="cursor-pointer label gap-2">
              <input
                name="assistants"
                value={assistant.id}
                type="checkbox"
                defaultChecked
                className="checkbox checkbox-info checkbox-sm"
              />
              <span className="label-text">Ask {assistant.name}</span>
            </label>
          ))}

          <button
            name="send"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isPending}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
