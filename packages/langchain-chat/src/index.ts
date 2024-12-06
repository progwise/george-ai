import * as mainChain from './main-chain'

export const ask = (parameters: { question: string; sessionId: string }) =>
  mainChain.historyChain.invoke(
    { question: parameters.question },
    { configurable: { sessionId: parameters.sessionId } },
  )
