import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { setRetrievalFlow } from '@george-ai/langchain-chat/src/session-flow-store'
import { retrievalFlowValues } from '@george-ai/langchain-chat/src/retrievalFlow'

export const setFlowForSession = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        sessionId: z.string().max(10),
        retrievalFlow: z.enum(retrievalFlowValues),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    setRetrievalFlow(data.sessionId, data.retrievalFlow)
    return { success: true }
  })
