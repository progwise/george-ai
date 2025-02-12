import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User } from '../../gql/graphql'
import {
  GetMessagesQueryOptions,
  sendMessage,
} from '../../server-functions/conversations'

interface ConversationFormProps {
  user: User
  conversationId: string
}
export const ConversationForm = ({
  conversationId,
  user,
}: ConversationFormProps) => {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (content: string) => {
      if (!content || content.trim().length < 3) {
        throw new Error('Message must be at least 3 characters')
      }
      const result = await sendMessage({
        data: {
          userId: user.id,
          conversationId,
          content,
        },
      })
      return result
    },
    onSettled: async () => {
      console.log('Message sent')
      await queryClient.invalidateQueries(
        GetMessagesQueryOptions(conversationId, user.id),
      )
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

  return (
    <div className="chat chat-end gap-2">
      <div className="chat-image avatar">{user?.name || 'Unknown'}</div>
      <div className="chat-bubble">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-slate-950"
            placeholder="Type a message"
            rows={2}
            name="message"
          ></textarea>
          <button type="submit" className="btn">
            Send conversationId: {conversationId}
          </button>
        </form>
      </div>
    </div>
  )
}
