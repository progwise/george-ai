import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { chatStore } from '../store/langchain-chat-store'

export const sendChatMessage = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({ message: z.string().max(200), sessionId: z.string().max(10) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return chatStore.sendChatMessage(data.message, data.sessionId)
  })
