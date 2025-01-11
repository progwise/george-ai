import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '../server-functions/langchain-send-chat-message'
import { chatMessagesQueryOptions } from '../server-functions/langchain-chat-history'
import { RetrievalFlow } from '@george-ai/langchain-chat'
import { useAuth } from '../auth'

type LangchainChatFormProps = {
  sessionId: string
  retrievalFlow: RetrievalFlow
}

const handleTextareaKeyDown = (
  event: React.KeyboardEvent<HTMLTextAreaElement>,
) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()

    event.currentTarget.form?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    )
  }
}

export const LangchainChatForm = ({
  sessionId,
  retrievalFlow,
}: LangchainChatFormProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const { mutate, error, status } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({ data: { message, sessionId, retrievalFlow } }),
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
            },
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'bot',
              text: '.........',
              source: '',
              time: new Date(),
              retrievalFlow,
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

    mutate(message)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
      <textarea
        className="textarea textarea-bordered flex-grow w-full"
        name="message"
        onKeyDown={handleTextareaKeyDown}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!auth?.isAuthenticated || status === 'pending'}
      >
        Send
      </button>
      {error && <div>{error.message}</div>}
      {!auth?.isAuthenticated && <div>Sign in to chat</div>}
    </form>
  )
}
