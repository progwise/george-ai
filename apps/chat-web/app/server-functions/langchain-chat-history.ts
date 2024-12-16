import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/start'
import { LangchainChatMessage, chatStore } from '../store/langchain-chat-store'

const fetchChatHistory = createServerFn({ method: 'GET' })
  .validator((sessionId: string) => sessionId)
  .handler(async (ctx): Promise<LangchainChatMessage[]> => {
    return chatStore.getChat(ctx.data)
  })

const fetchNewChat = createServerFn({ method: 'GET' }).handler(async () => {
  return chatStore.getNewChat()
})

export const chatMessagesQueryOptions = () =>
  queryOptions({
    queryKey: ['langchainChatMessages'],
    queryFn: (request) => {
      console.log('request', request)
      const sessionId = request.queryKey['sessionId']
      if (!sessionId) {
        fetchNewChat()
      } else {
        fetchChatHistory(sessionId)
      }
    },
  })

export const reset = createServerFn({ method: 'POST' })
  .validator((sessionId: string) => sessionId)
  .handler(async (ctx) => {
    return chatStore.reset(ctx.data)
  })
