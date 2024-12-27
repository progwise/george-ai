import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { chatStore } from '../store/langchain-chat-store'

export const sendChatMessage = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        message: z.string().max(200),
        sessionId: z.string().max(10),
        retrievalFlow: z.enum([
          'sequential',
          'parallel',
          'onlyLocal',
          'onlyWeb',
        ]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return chatStore.sendChatMessage(
      data.message,
      data.sessionId,
      data.retrievalFlow,
    )
  })
