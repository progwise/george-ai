import { createFileRoute } from '@tanstack/react-router'
import { chatMessagesQueryOptions } from '../server-functions/chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChatForm } from '../components/chat-form'

const ChatRoute = () => {
  const chatMessagesQuery = useSuspenseQuery(chatMessagesQueryOptions())

  return (
    <>
      <h1>Chat</h1>
      <ol></ol>
      {chatMessagesQuery.data.map((message) => (
        <li
          key={message.id}
          style={{ color: message.sender === 'user' ? 'blue' : 'green' }}
        >
          {message.text}
        </li>
      ))}
      <ChatForm />
    </>
  )
}

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
