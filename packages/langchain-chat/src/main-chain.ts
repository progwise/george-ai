import { ChatOpenAI } from '@langchain/openai'
import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { localPrompt, webPrompt, apologyPrompt } from './prompts'
import { getMessageHistory } from './message-history'
// import { getPDFContentForQuestion } from './memory-vectorstore'
import { getPDFContentForQuestion } from './typesense-vectorstore'
import { getWebContent } from './web-vectorstore'
import * as z from 'zod'

const outputSchema = z.object({
  answer: z
    .string()
    .describe(
      'The answer to the human question without any hidden special characters.',
    ),
  source: z
    .string()
    .describe(
      'One of "local", "web", or "model", indicating the origin of the final answer.',
    ),
  notEnoughInformation: z
    .boolean()
    .describe(
      'Set to true only if the given context does not contain relevant info. Otherwise, false.',
    ),
})

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
})

const pdfChain = RunnableSequence.from([
  localPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

const webChain = RunnableSequence.from([
  async (input) => {
    const context = await getWebContent({
      question: input.question,
    })
    return { ...input, context }
  },
  webPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

const modelChain = RunnableSequence.from([
  apologyPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

const branchChain = RunnableLambda.from(async (input, options) => {
  const localResponse = await pdfChain.invoke(input, options)
  if (!localResponse.notEnoughInformation) {
    return localResponse
  }

  const webResponse = await webChain.invoke(input, options)
  if (!webResponse.notEnoughInformation) {
    return webResponse
  }

  return await modelChain.invoke(input, options)
})

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
