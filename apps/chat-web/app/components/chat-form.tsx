import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '../server-functions/send-chat-message'
import { chatMessagesQueryOptions } from '../server-functions/chat-history'

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

export const ChatForm = () => {
  const queryClient = useQueryClient()
  const { mutate, error } = useMutation({
    mutationFn: (message: string) => sendChatMessage({ data: { message } }),
    onMutate: async (message) => {
      await queryClient.cancelQueries(chatMessagesQueryOptions())

      const previousMessages = queryClient.getQueryData(
        chatMessagesQueryOptions().queryKey,
      )

      if (previousMessages) {
        queryClient.setQueryData(chatMessagesQueryOptions().queryKey, [
          ...previousMessages,
          {
            id: Math.random().toString(),
            sender: 'user',
            text: message,
          },
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: '.........',
          },
        ])
      }

      return { previousMessages }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatMessagesQueryOptions().queryKey,
          context.previousMessages,
        )
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(chatMessagesQueryOptions().queryKey, result)
    },
    onSettled: () => {
      queryClient.invalidateQueries(chatMessagesQueryOptions())
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
        onKeyDown={handleTextareaKeyDown}
      />
      <button type="submit" className="btn btn-primary">
        Send
      </button>
      {error && <div>{error.message}</div>}
    </form>
  )
}
