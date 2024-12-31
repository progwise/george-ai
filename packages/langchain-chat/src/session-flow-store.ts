import { retrievalFlowValues } from './retrievalFlow'

export type RetrievalFlow = (typeof retrievalFlowValues)[number]

const sessionFlows = new Map<string, RetrievalFlow>()

export function setRetrievalFlow(sessionId: string, flow: RetrievalFlow) {
  sessionFlows.set(sessionId, flow)
}

export function getRetrievalFlow(sessionId: string): RetrievalFlow {
  return sessionFlows.get(sessionId) ?? 'Sequential'
}
