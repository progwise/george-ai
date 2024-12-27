import * as mainChain from './main-chain'
import * as vectorStore from './typesense-vectorstore'

export const ask = (parameters: {
  question: string
  sessionId: string
  retrievalFlow: 'sequential' | 'parallel' | 'onlyLocal' | 'onlyWeb'
}) =>
  mainChain.historyChain.invoke(
    { question: parameters.question, retrievalFlow: parameters.retrievalFlow },
    { configurable: { sessionId: parameters.sessionId } },
  )

export const processUnprocessedDocuments = async () => {
  await vectorStore.loadUprocessedDocumentsIntoVectorStore()
}
