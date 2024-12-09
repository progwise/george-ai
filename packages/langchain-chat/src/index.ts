import * as mainChain from './main-chain'
import * as vectorStore from './typesense-vectorstore'

export const ask = (parameters: { question: string; sessionId: string }) =>
  mainChain.historyChain.invoke(
    { question: parameters.question },
    { configurable: { sessionId: parameters.sessionId } },
  )

export const processUnprocessedDocuments = async () => {
  await vectorStore.loadUprocessedDocumentsIntoVectorStore()
}
