import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/start'
import { ChatMessage, chatStore } from '../store/chat-store'

const fetchChatHistory = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ChatMessage[]> => {
    // Simulate a slow network request
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return chatStore.getChat()
  },
)

export const chatMessagesQueryOptions = () =>
  queryOptions({
    queryKey: ['chatMessages'],
    queryFn: () => fetchChatHistory(),
  })
