// packages/langchain-chat/src/index.ts

import * as mainChain from './main-chain'
import { RetrievalFlow } from './retrieval-flow'
import * as vectorStore from './typesense-vectorstore'

export * from './retrieval-flow'

export const ask = (parameters: {
  question: string
  sessionId: string
  retrievalFlow: RetrievalFlow
  modelType: 'OpenAI' | 'Google'
}) =>
  mainChain.historyChain.invoke(
    { question: parameters.question },
    {
      configurable: {
        sessionId: parameters.sessionId,
        retrievalFlow: parameters.retrievalFlow,
        modelType: parameters.modelType,
      },
    },
  )

export const processUnprocessedDocuments = async () => {
  await vectorStore.loadUprocessedDocumentsIntoVectorStore()
}

// re-export from 'typesense-vectorstore.ts'
export {
  dropVectorStore,
  dropFile,
  embedFile,
  loadUprocessedDocumentsIntoVectorStore,
  getPDFContentForQuestion,
} from './typesense-vectorstore'
