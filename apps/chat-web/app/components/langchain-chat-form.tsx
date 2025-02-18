import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '../server-functions/langchain-send-chat-message'
import { chatMessagesQueryOptions } from '../server-functions/langchain-chat-history'
import { RetrievalFlow } from '@george-ai/langchain-chat'
import Alert from './alert'
import { useAuth } from '../auth/auth-context'

type LangchainChatFormProps = {
  sessionId: string
  retrievalFlow: RetrievalFlow
  modelChoice: string
  inputText: string
  setInputText: (text: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export const LangchainChatForm = ({
  sessionId,
  retrievalFlow,
  modelChoice,
  inputText,
  setInputText,
  onKeyDown,
}: LangchainChatFormProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const {
    mutate: mutateOpenAI,
    error: errorOpenAI,
    status: statusOpenAI,
  } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({
        data: { message, sessionId, retrievalFlow, modelChoice: 'OpenAI' },
      }),
    onMutate: async (message) => {
      await queryClient.cancelQueries(chatMessagesQueryOptions(sessionId))

      const previousMessages = queryClient.getQueryData(
        chatMessagesQueryOptions(sessionId).queryKey,
      )

      if (previousMessages) {
        queryClient.setQueryData(chatMessagesQueryOptions(sessionId).queryKey, {
          sessionId,
          messages: [
            ...previousMessages.messages,
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'user',
              text: message,
              source: '',
              time: new Date(),
              retrievalFlow,
              model: 'OpenAI',
            },
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'bot',
              text: '.........',
              source: '',
              time: new Date(),
              retrievalFlow,
              model: 'OpenAI',
            },
          ],
        })
      }

      return { previousMessages }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatMessagesQueryOptions(sessionId).queryKey,
          context.previousMessages,
        )
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(chatMessagesQueryOptions(sessionId).queryKey, {
        sessionId,
        messages: result,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(chatMessagesQueryOptions(sessionId))
    },
  })

  const {
    mutate: mutateGoogle,
    error: errorGoogle,
    status: statusGoogle,
  } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({
        data: { message, sessionId, retrievalFlow, modelChoice: 'Google' },
      }),
    onMutate: async (message) => {
      await queryClient.cancelQueries(chatMessagesQueryOptions(sessionId))

      const previousMessages = queryClient.getQueryData(
        chatMessagesQueryOptions(sessionId).queryKey,
      )

      if (previousMessages) {
        queryClient.setQueryData(chatMessagesQueryOptions(sessionId).queryKey, {
          sessionId,
          messages: [
            ...previousMessages.messages,
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'user',
              text: message,
              source: '',
              time: new Date(),
              retrievalFlow,
              model: 'Google',
            },
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'bot',
              text: '.........',
              source: '',
              time: new Date(),
              retrievalFlow,
              model: 'Google',
            },
          ],
        })
      }

      return { previousMessages }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatMessagesQueryOptions(sessionId).queryKey,
          context.previousMessages,
        )
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(chatMessagesQueryOptions(sessionId).queryKey, {
        sessionId,
        messages: result,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(chatMessagesQueryOptions(sessionId))
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const message = formData.get('message') as string

    form.reset()
    setInputText('')

    mutateOpenAI(message)
    mutateGoogle(message)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value)
  }

  const disabled =
    !auth?.isAuthenticated ||
    statusOpenAI === 'pending' ||
    statusGoogle === 'pending'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
      <textarea
        className="textarea textarea-bordered flex-grow w-full"
        name="message"
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <div className="flex gap-2 align-middle">
        {errorOpenAI && modelChoice === 'OpenAI' && (
          <Alert message={errorOpenAI.message} type="error" />
        )}
        {errorGoogle && modelChoice === 'Google' && (
          <Alert message={errorGoogle.message} type="error" />
        )}
        {!auth?.isAuthenticated && (
          <Alert message="Sign in to chat" type="warning" className="py-2">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => auth?.login()}
            >
              Sign in
            </button>
          </Alert>
        )}
        <button type="submit" className="btn btn-primary" disabled={disabled}>
          Send
        </button>
      </div>
    </form>
  )
}
