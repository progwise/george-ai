import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/start'
import { LangchainChatMessage, chatStore } from '../store/langchain-chat-store'

const fetchChatHistory = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LangchainChatMessage[]> => {
    // Simulate a slow network request
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    return chatStore.getChat()
  },
)

export const chatMessagesQueryOptions = () =>
  queryOptions({
    queryKey: ['chatMessages'],
    queryFn: () => fetchChatHistory(),
  })

export const reset = createServerFn({ method: 'POST' }).handler(async () => {
  return await chatStore.reset()
})
