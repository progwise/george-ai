import { RetrievalFlow } from './retrievalFlow'

const sessionFlows = new Map<string, RetrievalFlow>()

export const setRetrievalFlow = (sessionId: string, flow: RetrievalFlow) => {
  sessionFlows.set(sessionId, flow)
}

export const getRetrievalFlow = (sessionId: string): RetrievalFlow => {
  return sessionFlows.get(sessionId) ?? 'Sequential'
}
