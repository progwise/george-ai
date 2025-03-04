import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { LangchainChatMessage, chatStore } from '../store/langchain-chat-store'

const fetchChatHistory = createServerFn({ method: 'GET' })
  .validator((sessionId: string) => sessionId)
  .handler(async (ctx): Promise<LangchainChatMessage[]> => {
    return chatStore.getChat(ctx.data)
  })

const fetchNewChat = createServerFn({ method: 'GET' }).handler(async () => {
  return chatStore.getNewChat()
})

export const chatMessagesQueryOptions = (sessionId?: string) =>
  queryOptions({
    queryKey: ['langchainChatMessages', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        const newChatMessages = await fetchNewChat()
        return {
          sessionId: newChatMessages[0].sessionId,
          messages: newChatMessages,
        }
      } else {
        return {
          sessionId,
          messages: await fetchChatHistory({ data: sessionId }),
        }
      }
    },
  })

export const reset = createServerFn({ method: 'POST' })
  .validator((sessionId: string) => sessionId)
  .handler((ctx) => {
    const messages = chatStore.reset(ctx.data)
    return { sessionId: messages[0].sessionId, messages }
  })
