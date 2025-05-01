import * as mainChain from './main-chain'
import { RetrievalFlow } from './retrieval-flow'

export * from './retrieval-flow'

export * from './assistant-chain'

export const ask = (parameters: { question: string; sessionId: string; retrievalFlow: RetrievalFlow }) =>
  mainChain.historyChain.invoke(
    { question: parameters.question },
    {
      configurable: {
        sessionId: parameters.sessionId,
        retrievalFlow: parameters.retrievalFlow,
      },
    },
  )

export * from './typesense-vectorstore'
