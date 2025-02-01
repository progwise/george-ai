import { createFileRoute } from '@tanstack/react-router'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Dropdown } from '../components/dropdown'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { useState, useEffect } from 'react'
import { RetrievalFlow } from '@george-ai/langchain-chat'
import { FormattedMarkdown } from '../components/formatted-markdown'
import { useTranslation } from 'react-i18next'

const ChatRoute = () => {
  const { t: translation } = useTranslation()

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4">
        <Dropdown
          className="w-52"
          title={translation(`flow${selectedFlow}`)}
          options={[
            {
              title: translation('flowSequential'),
              action: () => setSelectedFlow('Sequential'),
            },
            {
              title: translation('flowParallel'),
              action: () => setSelectedFlow('Parallel'),
            },
            {
              title: translation('flowLocal'),
              action: () => setSelectedFlow('Only Local'),
            },
            {
              title: translation('flowWeb'),
              action: () => setSelectedFlow('Only Web'),
            },
          ]}
        />

        <button
          type="button"
          className="btn btn-accent"
          onClick={async () => {
            if (!data?.sessionId) return
            const { sessionId: newId } = await reset({
              data: data.sessionId,
            })
            setSessionId(newId)
            refetch()
          }}
        >
          {translation('resetConversation')}
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
              <time className="text-xs opacity-50 ml-2">
                {message.time.toString()}
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
