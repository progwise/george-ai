import { createFileRoute } from '@tanstack/react-router'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { useState, useEffect } from 'react'

const ChatRoute = () => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const { data, refetch, isSuccess } = useSuspenseQuery(
    chatMessagesQueryOptions(sessionId),
  )

  if (isSuccess && data.sessionId !== sessionId) {
    setSessionId(data.sessionId)
  }

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [data])

  return (
    <div className="flex flex-col gap-2 prose mb-10">
      <h1>Langchain Chat</h1>
      <button
        type="button"
        onClick={async () => {
          const { sessionId } = await reset({ data: data.sessionId })
          setSessionId(sessionId)
          refetch()
        }}
      >
        Reset
      </button>
      <section>
        {data.messages.map((message) => (
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
      <LangchainChatForm sessionId={data.sessionId} />
    </div>
  )
}

export const Route = createFileRoute('/langchain-chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
