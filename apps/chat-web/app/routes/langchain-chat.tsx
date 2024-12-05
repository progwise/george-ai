import { createFileRoute } from '@tanstack/react-router'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { useEffect } from 'react'

const ChatRoute = () => {
  const { data, refetch, status } = useSuspenseQuery(chatMessagesQueryOptions())

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [data])

  return (
    <div className="flex flex-col gap-2 prose mb-10">
      <h1>Langchain Chat</h1>
      <button
        onClick={async () => {
          await reset()
          refetch()
        }}
      >
        Reset
      </button>
      <section>
        {data.map((message) => (
          <div
            className={`chat ${message.sender === 'bot' ? 'chat-start' : 'chat-end'}`}
            key={message.id}
          >
            <div className="chat-header">
              <span>{message.sender}</span>
              <time className="text-xs opacity-50 ml-2">
                {message.time.toString()}
              </time>
            </div>
            <div className="chat-bubble">{message.text}</div>
            <div className="chat-footer opacity-50">{message.source}</div>
          </div>
        ))}
      </section>
      <LangchainChatForm />
    </div>
  )
}

export const Route = createFileRoute('/langchain-chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
