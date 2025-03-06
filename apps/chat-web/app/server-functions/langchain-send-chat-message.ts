import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { retrievalFlowValues } from '@george-ai/langchain-chat'

import { chatStore } from '../store/langchain-chat-store'

export const sendChatMessage = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        message: z.string().max(200),
        sessionId: z.string().max(10),
        retrievalFlow: z.enum(retrievalFlowValues),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return chatStore.sendChatMessage(data.message, data.sessionId, data.retrievalFlow)
  })
