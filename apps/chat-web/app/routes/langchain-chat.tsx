import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { Dropdown } from '../components/dropdown'
import { RetrievalFlow } from '@george-ai/langchain-chat/src/retrievalFlow'

const ChatRoute = () => {
  const [retrievalFlow, setRetrievalFlow] =
    useState<RetrievalFlow>('Sequential')
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)

  const { data, refetch, isSuccess } = useSuspenseQuery(
    chatMessagesQueryOptions(sessionId),
  )

  useEffect(() => {
    if (isSuccess && data.sessionId !== sessionId) {
      setSessionId(data.sessionId)
    }
  }, [isSuccess, data, sessionId])

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [data])

  return (
    <div className="flex flex-col gap-4 prose mb-10">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between">
            <Dropdown
              title="Retrieval Flow"
              options={[
                {
                  title: 'Sequential',
                  action: () => setRetrievalFlow('Sequential'),
                },
                {
                  title: 'Parallel',
                  action: () => setRetrievalFlow('Parallel'),
                },
                {
                  title: 'Only Local',
                  action: () => setRetrievalFlow('onlyLocal'),
                },
                {
                  title: 'Only Web',
                  action: () => setRetrievalFlow('onlyWeb'),
                },
              ]}
            />
            <button
              type="button"
              className="btn mb-1"
              onClick={async () => {
                if (data?.sessionId) {
                  const { sessionId: newId } = await reset({
                    data: data.sessionId,
                  })
                  setSessionId(newId)
                  refetch()
                }
              }}
            >
              Reset
            </button>
          </div>
          <div className="mt-2">
            Current Retrieval Flow: <b>{formatRetrievalFlow(retrievalFlow)}</b>
          </div>
        </div>
      </div>

      <section>
        {data?.messages.map((message) => (
          <div
            className={`chat ${
              message.sender === 'bot' ? 'chat-start' : 'chat-end'
            }`}
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

      {data?.sessionId && (
        <LangchainChatForm
          sessionId={data.sessionId}
          retrievalFlow={retrievalFlow}
        />
      )}
    </div>
  )
}

export const Route = createFileRoute('/langchain-chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})

const formatRetrievalFlow = (flow: string) => {
  return flow
    .split(/(?=[A-Z])|_/g)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
