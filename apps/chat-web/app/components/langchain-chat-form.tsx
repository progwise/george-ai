import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '../server-functions/langchain-send-chat-message'
import { chatMessagesQueryOptions } from '../server-functions/langchain-chat-history'

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

export const LangchainChatForm = () => {
  const queryClient = useQueryClient()
<<<<<<< HEAD
  const { mutate, error, status } = useMutation({
=======
  const { mutate, error } = useMutation({
>>>>>>> 4cf6f35 (langchain connectivity)
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
            source: 'web or local',
            time: new Date(),
          },
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: '.........',
            source: 'web or local',
            time: new Date(),
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
<<<<<<< HEAD
      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'pending'}
      >
=======
      <button type="submit" className="btn btn-primary">
>>>>>>> 4cf6f35 (langchain connectivity)
        Send
      </button>
      {error && <div>{error.message}</div>}
    </form>
  )
}
