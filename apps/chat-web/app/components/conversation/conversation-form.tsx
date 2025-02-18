import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '../../server-functions/conversations'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useAuth } from '../../auth/auth-context'
import { queryKeys } from '../../query-keys'

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
  const queryClient = useQueryClient()
  const conversation = useFragment(
    ConversationForm_ConversationFragment,
    props.conversation,
  )
  const { user } = useAuth()

  const { mutate } = useMutation({
    mutationFn: async (content: string) => {
      if (!user) {
        throw new Error('User not set')
      }
      if (!content || content.trim().length < 3) {
        throw new Error('Message must be at least 3 characters')
      }
      const result = await sendMessage({
        data: {
          userId: user.id,
          conversationId: conversation.id!,
          content,
        },
      })
      return result
    },
    onSettled: async () => {
      if (!user) {
        throw new Error('User not set')
      }
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
    },
  })
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const content = formData.get('message') as string

    form.reset()

    mutate(content)
  }

  if (!user) {
    return <h3>Login to send messages</h3>
  }

  return (
    <div className="chat chat-end gap-2">
      <div className="chat-image avatar">{user.name || user.username}</div>
      <div className="chat-bubble w-full">
        <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
          <textarea
            className="textarea textarea-bordered flex-grow w-full text-black"
            placeholder="Type your message"
            rows={2}
            name="message"
          ></textarea>
          <div className="flex gap-2">
            {conversation.assistants?.map((assistant) => (
              <label key={assistant.id} className="cursor-pointer label gap-2">
                <input
                  name="assistants"
                  value={assistant.id}
                  type="checkbox"
                  defaultChecked
                  className="checkbox checkbox-info"
                />
                <span className="label-text text-gray-200 ">
                  Ask {assistant.name}
                </span>
              </label>
            ))}

            <button name="send" type="submit" className="btn">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
