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
      <h1>Agent Path</h1>

      {/* Menu Row */}
      <div className="flex justify-between">
        {/* Dropdown Start */}

        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">
            Chain Selector
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <a>Sequential: Local & Web</a>
            </li>
            <li>
              <a>Parallel: Local & Web</a>
            </li>
            <li>
              <a>Only: Local</a>
            </li>
            <li>
              <a>Only: Web</a>
            </li>
          </ul>
        </div>
        {/* Dropdown End*/}
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
      </div>
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
