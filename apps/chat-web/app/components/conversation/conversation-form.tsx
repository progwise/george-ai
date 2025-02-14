import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AiConversation, User } from '../../gql/graphql'
import {
  GetMessagesQueryOptions,
  sendMessage,
} from '../../server-functions/conversations'

interface ConversationFormProps {
  user: User
  conversation: Partial<AiConversation>
}
export const ConversationForm = ({
  conversation,
  user,
}: ConversationFormProps) => {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (data: {
      content: string
      recipientAssistantIds: string[]
    }) => {
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
    onSettled: async () => {
      console.log('Message sent')
      await queryClient.invalidateQueries(
        GetMessagesQueryOptions(conversation.id, user.id),
      )
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

    console.log('recipientAssistantIds', recipientAssistantIds)

    form.reset()

    mutate({ content, recipientAssistantIds })
  }

  return (
    <div className="chat chat-end gap-2">
      <div className="chat-image avatar">{user?.name || 'Unknown'}</div>
      <div className="chat-bubble w-full">
        <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
          <textarea
            className="textarea textarea-bordered flex-grow w-full"
            placeholder="Type a message"
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
