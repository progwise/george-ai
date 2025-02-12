import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useState, useEffect } from 'react'
import { RetrievalFlow } from '@george-ai/langchain-chat'

import { LangchainChatForm } from '../components/langchain-chat-form'
import { Dropdown } from '../components/dropdown'
import {
  FormattedMarkdown,
  LoadingIndicator,
} from '../components/formatted-markdown'

export const Route = createFileRoute('/langchain-new-ui')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})

function RouteComponent() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [selectedFlow, setSelectedFlow] = useState<RetrievalFlow>('Sequential')

  const { data, refetch, isSuccess } = useSuspenseQuery(
    chatMessagesQueryOptions(sessionId),
  )

  if (isSuccess && data.sessionId !== sessionId) {
    setSessionId(data.sessionId)
  }

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [data])

  const handleReset = async () => {
    if (!data?.sessionId) return
    const { sessionId: newId } = await reset({ data: data.sessionId })
    setSessionId(newId)
    refetch()
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <header className="flex justify-end items-center gap-4 mb-2">
        <Dropdown
          className="w-52"
          title={`Flow: ${selectedFlow}`}
          options={[
            {
              title: 'Flow: Sequential',
              action: () => setSelectedFlow('Sequential'),
            },
            {
              title: 'Flow: Parallel',
              action: () => setSelectedFlow('Parallel'),
            },
            {
              title: 'Flow: Only Local',
              action: () => setSelectedFlow('Only Local'),
            },
            {
              title: 'Flow: Only Web',
              action: () => setSelectedFlow('Only Web'),
            },
          ]}
        />
        <button type="button" className="btn btn-accent" onClick={handleReset}>
          Reset conversation
        </button>
      </header>

      <section className="flex flex-col gap-4">
        {data?.messages.map((message) => (
          <div
            key={message.id}
            className="card bg-base-350 text-base-content shadow-md border border-base-300 p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-500 text-neutral-content flex items-center justify-center">
                {message.sender === 'bot' ? 'AI' : 'U'}
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {message.sender === 'bot' ? 'George AI' : 'You'}
                </span>
                <span className="text-xs opacity-60">
                  {message.time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  ·{' '}
                  {message.time.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="border-t border-base-200 pt-3">
              {message.text === 'LOADING_INDICATOR' ? (
                <LoadingIndicator />
              ) : (
                <FormattedMarkdown markdown={message.text} />
              )}
            </div>
            <div className="mt-2 text-xs opacity-70">
              Source: {message.source}
            </div>
          </div>
        ))}
      </section>

      {data?.sessionId && (
        <div className="mt-4">
          <LangchainChatForm
            sessionId={data.sessionId}
            retrievalFlow={selectedFlow}
          />
        </div>
      )}
    </div>
  )
}
