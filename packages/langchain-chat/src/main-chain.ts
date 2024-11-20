import { ChatOpenAI } from '@langchain/openai'

import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { localPrompt, webPrompt } from './prompts'
import { getMessageHistory } from './message-history'
import { getPDFContentForQuestion } from './pdf-vectorstore'

const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.7 })

// process PDF context and model output
const pdfChain = RunnableSequence.from([
  (input) => {
    console.log('runnning pdfChain', input.question)
    return { ...input }
  },
  localPrompt,
  model,
  (output) => {
    console.log('finished pdfChain', output.content)
    return { pdfResult: output.content }
  },
])

// process web search and model output
const webChain = RunnableSequence.from([
  (input) => {
    console.log('runnning webChain', input.question)
    return { ...input }
  },
  webPrompt,
  model,
  (output) => {
    console.log('finished pdfChain', output.content)
    return { webResult: output.content }
  },
])

// branching between pdf and web chains
const branchChain = RunnableLambda.from(async (input: any, options: any) => {
  const localResponse = await pdfChain.invoke(input, options)
  if (localResponse.pdfResult.includes('NOT_FOUND')) {
    const webResponse = await webChain.invoke(input, options)
    return {
      answer: webResponse.webResult,
      source: 'web',
    }
  } else {
    return {
      answer: localResponse.pdfResult,
      source: 'pdf',
    }
  }
})

// setting up the context
const mainChain = RunnableSequence.from([
  async (input) => ({
    ...input,
    context: await getPDFContentForQuestion(input.question),
  }),
  branchChain,
])

export const historyChain = new RunnableWithMessageHistory({
  runnable: mainChain,
  getMessageHistory,
  inputMessagesKey: 'question',
  outputMessagesKey: 'answer',
  historyMessagesKey: 'chat_history',
})
