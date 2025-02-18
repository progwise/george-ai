import { createFileRoute } from '@tanstack/react-router'
import {
  chatMessagesQueryOptions,
  reset,
} from '../server-functions/langchain-chat-history'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { Dropdown } from '../components/dropdown'
import { LangchainChatForm } from '../components/langchain-chat-form'
import { useState, useEffect } from 'react'
import { RetrievalFlow } from '@george-ai/langchain-chat'
import { FormattedMarkdown } from '../components/formatted-markdown'
import { t } from 'i18next'
import { sendChatMessage } from '../server-functions/langchain-send-chat-message'

interface ChatSectionProps {
  title: string
  messages: Array<{
    id: string
    sender: string
    time: Date
    text: string
    source: string
  }>
  sessionId?: string
  retrievalFlow: RetrievalFlow
  modelChoice: string
  inputText: string
  setInputText: (text: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

const ChatSection = ({
  title,
  messages,
  sessionId,
  retrievalFlow,
  modelChoice,
  inputText,
  setInputText,
  onKeyDown,
}: ChatSectionProps) => (
  <section className="w-1/2 flex flex-col gap-4">
    <h2 className="text-lg font-bold">{title}</h2>
    {messages.length === 0 && (
      <div className="chat chat-start">
        <div className="chat-header">
          <span>bot</span>
          <time className="text-xs opacity-50 ml-2" suppressHydrationWarning>
            {`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
          </time>
        </div>
        <div className="chat-bubble">
          Hello, I am your travel assistant. How can I help you?
        </div>
        <div className="chat-footer opacity-50">George AI</div>
      </div>
    )}
    {messages.map((message) => (
      <div
        className={`chat ${
          message.sender === 'bot' ? 'chat-start' : 'chat-end'
        }`}
        key={message.id}
      >
        <div className="chat-header">
          <span>{message.sender}</span>
          <time className="text-xs opacity-50 ml-2" suppressHydrationWarning>
            {`${message.time.toLocaleDateString()} ${message.time.toLocaleTimeString()}`}
          </time>
        </div>
        <div className="chat-bubble">
          <FormattedMarkdown markdown={message.text} />
        </div>
        <div className="chat-footer opacity-50">{message.source}</div>
      </div>
    ))}
    {sessionId && (
      <LangchainChatForm
        sessionId={sessionId}
        retrievalFlow={retrievalFlow}
        modelChoice={modelChoice}
        inputText={inputText}
        setInputText={setInputText}
        onKeyDown={onKeyDown}
      />
    )}
  </section>
)

const handleTextareaKeyDown = (
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  inputText: string,
  setInputText: (text: string) => void,
  mutateOpenAI: (message: string) => void,
  mutateGoogle: (message: string) => void,
) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()

    const form = event.currentTarget.form
    if (form) {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    }

    mutateOpenAI(inputText)
    mutateGoogle(inputText)

    setInputText('')
  }
}

const ChatRoute = () => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [selectedFlow, setSelectedFlow] = useState<RetrievalFlow>('Sequential')
  const [inputText, setInputText] = useState<string>('')

  const { data, refetch, isSuccess } = useSuspenseQuery(
    chatMessagesQueryOptions(sessionId),
  )

  const { mutate: mutateOpenAI } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({
        data: {
          message,
          sessionId,
          retrievalFlow: selectedFlow,
          modelChoice: 'OpenAI',
        },
      }),
  })

  const { mutate: mutateGoogle } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({
        data: {
          message,
          sessionId,
          retrievalFlow: selectedFlow,
          modelChoice: 'Google',
        },
      }),
  })

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
          {t('resetConversation')}
        </button>
      </div>

      <div className="flex gap-4">
        <ChatSection
          title="OpenAI"
          messages={data?.messages.filter(
            (message) => message.model === 'OpenAI',
          )}
          sessionId={data?.sessionId}
          retrievalFlow={selectedFlow}
          modelChoice="OpenAI"
          inputText={inputText}
          setInputText={setInputText}
          onKeyDown={(event) =>
            handleTextareaKeyDown(
              event,
              inputText,
              setInputText,
              mutateOpenAI,
              mutateGoogle,
            )
          }
        />
        <ChatSection
          title="Google"
          messages={data?.messages.filter(
            (message) => message.model === 'Google',
          )}
          sessionId={data?.sessionId}
          retrievalFlow={selectedFlow}
          modelChoice="Google"
          inputText={inputText}
          setInputText={setInputText}
          onKeyDown={(event) =>
            handleTextareaKeyDown(
              event,
              inputText,
              setInputText,
              mutateOpenAI,
              mutateGoogle,
            )
          }
        />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/langchain-chat')({
  component: ChatRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(chatMessagesQueryOptions())
  },
})
