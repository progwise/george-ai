import { ChatOpenAI } from '@langchain/openai'

import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { localPrompt, webPrompt } from './prompts'
import { getPDFVectorStore } from './pdf-vectorstore'
import { getMessageHistory } from './message-history'

const LOCAL_RETRIEVAL_K = 4

// Retriever functions
const retrieveLocalContent = async (question: string) => {
  try {
    // Load retriever
    const vectorStore = await getPDFVectorStore()
    const retrieverLocal = vectorStore.asRetriever(LOCAL_RETRIEVAL_K)
    console.log('Searching PDF for:', question)
    const documents = await retrieverLocal.invoke(question)
    const content = documents
      .map((document_) => document_.pageContent)
      .join('\n\n')
    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}

const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.7 })

// Create the processing chains
const pdfChain = RunnableSequence.from([
  localPrompt,
  model,
  (output) => ({ pdfResult: output.content }),
])

const webChain = RunnableSequence.from([
  (input) => ({
    ...input,
    webResults: `Web search results for "${input.question}". Since the corresponding information was not found in the travel magazine, here's a detailed summary from web sources.`,
  }),
  webPrompt,
  model,
  (output) => ({ webResult: output.content }),
])

const branchChain = RunnableLambda.from(async (input: any, options: any) => {
  const localResponse = await pdfChain.invoke(input, options)
  if (localResponse.pdfResult.includes('NOT_FOUND')) {
    const webResponse = await webChain.invoke(input, options)
    return { ...webResponse, pdfResult: localResponse.pdfResult, source: 'web' }
  } else {
    return { ...localResponse, webResult: undefined, source: 'pdf' }
  }
})

const mainChain = RunnableSequence.from([
  async (input) => ({
    ...input,
    context: await retrieveLocalContent(input.question),
  }),
  branchChain,
])

export const historyChain = new RunnableWithMessageHistory({
  runnable: mainChain,
  getMessageHistory,
  inputMessagesKey: 'question',
  historyMessagesKey: 'chat_history',
})
