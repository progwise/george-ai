import { createFileRoute } from '@tanstack/react-router'
import { chatMessagesQueryOptions } from '../server-functions/chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChatForm } from '../components/chat-form'

const ChatRoute = () => {
  const chatMessagesQuery = useSuspenseQuery(chatMessagesQueryOptions())

  return (
    <div className="max-w-96 flex flex-col gap-2 prose">
      <h1>Chat</h1>
      <section>
        {chatMessagesQuery.data.map((message) => (
          <div
            className={`chat ${message.sender === 'bot' ? 'chat-start' : 'chat-end'}`}
            key={message.id}
          >
            <div className="chat-bubble">{message.text}</div>
          </div>
        ))}
      </section>
      <ChatForm />
    </div>
  )
}

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
