import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { setFlowForSession } from '../server-functions/langchain-set-flow'
import { Dropdown } from '../components/dropdown'

import { LangchainChatForm } from '../components/langchain-chat-form'

const ChatRoute = () => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)

  const [selectedFlow, setSelectedFlow] = useState<
    'Sequential' | 'Parallel' | 'onlyLocal' | 'onlyWeb'
  >('Sequential')

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

  async function handleFlowChange(
    flow: 'Sequential' | 'Parallel' | 'onlyLocal' | 'onlyWeb',
  ) {
    setSelectedFlow(flow)
    if (sessionId) {
      await setFlowForSession({
        data: {
          sessionId,
          retrievalFlow: flow,
        },
      })
    }
  }

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
                  action: () => handleFlowChange('Sequential'),
                },
                {
                  title: 'Parallel',
                  action: () => handleFlowChange('Parallel'),
                },
                {
                  title: 'Only Local',
                  action: () => handleFlowChange('onlyLocal'),
                },
                {
                  title: 'Only Web',
                  action: () => handleFlowChange('onlyWeb'),
                },
              ]}
            />

            <button
              type="button"
              className="btn mb-1"
              onClick={async () => {
                if (!data?.sessionId) return
                const { sessionId: newId } = await reset({
                  data: data.sessionId,
                })
                setSessionId(newId)
                refetch()
              }}
            >
              Reset
            </button>
          </div>
          <div className="mt-2">
            Current Retrieval Flow: <b>{selectedFlow}</b>
          </div>
        </div>
      </div>

      <section>
        {data?.messages.map((message) => (
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

      {data?.sessionId && <LangchainChatForm sessionId={data.sessionId} />}
    </div>
  )
}

export const Route = createFileRoute('/langchain-chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
