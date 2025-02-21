import { historyChain as openAiChain } from './main-chain'
import { historyChain as googleChain } from './main-chain-google'
import { RetrievalFlow } from './retrieval-flow'
import * as vectorStore from './typesense-vectorstore'

export * from './retrieval-flow'

export type ModelChoice = 'gpt-4' | 'gemini-1.5-pro'

export const ask = (params: {
  question: string
  sessionId: string
  retrievalFlow: RetrievalFlow
  modelChoice?: ModelChoice
}) => {
  const { question, sessionId, retrievalFlow, modelChoice = 'gpt-4' } = params

  const chain = modelChoice === 'gemini-1.5-pro' ? googleChain : openAiChain

  return chain.invoke(
    { question },
    {
      configurable: {
        sessionId,
        retrievalFlow,
      },
    },
  )
}

export const processUnprocessedDocuments = async () => {
  await vectorStore.loadUprocessedDocumentsIntoVectorStore()
}

export * from './typesense-vectorstore'
