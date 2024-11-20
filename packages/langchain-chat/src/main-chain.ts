import { ChatOpenAI } from '@langchain/openai'

import {
  RunnableSequence,
  RunnableBranch,
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
    // console.log('Found PDF content:', content.length > 0)
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
  (output) => `[Magazine Source] ${output.content}`,
])

const webChain = RunnableSequence.from([
  (input) => ({
    ...input,
    webResults: `Web search results for "${input.question}". Since the corresponding information was not found in the travel magazine, here's a detailed summary from web sources.`,
  }),
  webPrompt,
  model,
  (output) => `[Web Source] ${output.content}`,
])

const localOrWebChain = new RunnableLambda({
  func: async (input: any, options: any) => {
    const localResponse = await pdfChain.invoke(input, options)
    if (localResponse.includes('NOT_FOUND')) {
      console.log('Magazine content insufficient, switching to web...')
      const webResponse = await webChain.invoke(input, options)
      return webResponse
    } else {
      return localResponse
    }
  },
})

const mainChain = RunnableSequence.from([
  async (input) => ({
    ...input,
    context: await retrieveLocalContent(input.question),
  }),
  RunnableBranch.from([
    [
      (input) => !!(input.context && input.context.trim().length > 0),
      localOrWebChain,
    ],
    webChain,
  ]),
])

export const historyChain = new RunnableWithMessageHistory({
  runnable: mainChain,
  getMessageHistory,
  inputMessagesKey: 'question',
  historyMessagesKey: 'chat_history',
})
