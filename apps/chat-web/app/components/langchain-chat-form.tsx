import React from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { chatMessagesQueryOptions } from '../server-functions/langchain-chat-history'
import { sendChatMessage } from '../server-functions/langchain-send-chat-message'

type LangchainChatFormProps = {
  sessionId: string
}

export const LangchainChatForm = ({ sessionId }: LangchainChatFormProps) => {
  const queryClient = useQueryClient()

  const { mutate, error, status } = useMutation({
    mutationFn: (message: string) =>
      sendChatMessage({ data: { message, sessionId } }),
    onMutate: async (message) => {
      await queryClient.cancelQueries(chatMessagesQueryOptions(sessionId))

      const previousData = queryClient.getQueryData(
        chatMessagesQueryOptions(sessionId).queryKey,
      )

      if (previousData) {
        queryClient.setQueryData(chatMessagesQueryOptions(sessionId).queryKey, {
          sessionId,
          messages: [
            ...previousData.messages,
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'user',
              text: message,
              source: '',
              time: new Date(Date.now()),
            },
            {
              id: Math.random().toString(),
              sessionId,
              sender: 'bot',
              text: '...',
              source: '',
              time: new Date(Date.now()),
            },
          ],
        })
      }

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          chatMessagesQueryOptions(sessionId).queryKey,
          context.previousData,
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <textarea
        className="textarea textarea-bordered flex-grow"
        name="message"
        placeholder="Type your question..."
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'pending'}
      >
        Send
      </button>
      {error && <div className="text-red-500">{(error as Error).message}</div>}
    </form>
  )
}
