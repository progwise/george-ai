import { createFileRoute } from '@tanstack/react-router'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Dropdown } from '../components/dropdown'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { useState, useEffect } from 'react'
import {
  RetrievalFlow,
  processUnprocessedDocuments,
} from '@george-ai/langchain-chat'
import { FormattedMarkdown } from '../components/formatted-markdown'
import { t } from 'i18next'

const ChatRoute = () => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [selectedFlow, setSelectedFlow] = useState<RetrievalFlow>('Sequential')
  const [modelChoice, setModelChoice] = useState<'openai' | 'gemini'>('openai')

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
  const handleProcessDocuments = async () => {
    await processUnprocessedDocuments(modelChoice)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4">
        {/* Existing flow dropdown */}
        <Dropdown
          className="w-52"
          title={t(`flow${selectedFlow}`)}
          options={[
            {
              title: t('flowSequential'),
              action: () => setSelectedFlow('Sequential'),
            },
            {
              title: t('flowParallel'),
              action: () => setSelectedFlow('Parallel'),
            },
            {
              title: t('flowLocal'),
              action: () => setSelectedFlow('Only Local'),
            },
            {
              title: t('flowWeb'),
              action: () => setSelectedFlow('Only Web'),
            },
          ]}
        />

        {/* New dropdown for model choice */}
        <Dropdown
          className="w-52"
          title={`Model: ${modelChoice}`}
          options={[
            {
              title: 'OpenAI Embeddings',
              action: () => setModelChoice('openai'),
            },
            {
              title: 'Gemini Embeddings',
              action: () => setModelChoice('gemini'),
            },
          ]}
        />

        <button type="button" className="btn btn-accent" onClick={handleReset}>
          {t('resetConversation')}
        </button>

        {/* Button to process unprocessed docs with chosen embedding model */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleProcessDocuments}
        >
          Process Docs
        </button>
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
              <time
                className="text-xs opacity-50 ml-2"
                suppressHydrationWarning
              >
                {`${message.time.toLocaleDateString()} ${message.time.toLocaleTimeString()}`}
              </time>
            </div>
            <div className="chat-bubble">
              <FormattedMarkdown markdown={message.text} />
            </div>
            <div className="chat-footer opacity-50">{message.source}</div>
          </div>
        ))}
      </section>
      {data?.sessionId && (
        <LangchainChatForm
          sessionId={data.sessionId}
          retrievalFlow={selectedFlow}
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
