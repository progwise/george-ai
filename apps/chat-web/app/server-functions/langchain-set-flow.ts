import {
  RetrievalFlow,
  retrievalFlowValues,
} from '@george-ai/langchain-chat/src/retrievalFlow'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'

const sessionFlows = new Map<string, RetrievalFlow>()

export const setRetrievalFlow = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        sessionId: z.string().max(10),
        retrievalFlow: z.enum(retrievalFlowValues),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    sessionFlows.set(data.sessionId, data.retrievalFlow)
    return { success: true }
  })

export const getRetrievalFlow = (sessionId: string): RetrievalFlow => {
  return sessionFlows.get(sessionId) ?? 'Sequential'
}
