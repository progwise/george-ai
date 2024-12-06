import { ChatOpenAI } from '@langchain/openai'
import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { localPrompt, webPrompt, modelOnlyPrompt } from './prompts'
import { getMessageHistory } from './message-history'
import { getPDFContentForQuestion } from './pdf-vectorstore'
import { getWebContent } from './web-vectorstore'
import * as z from 'zod'

const outputSchema = z.object({
  answer: z
    .string()
    .describe(
      'The answer to the human question without any hidden special characters. Must follow the prompt instructions.',
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
    input.context = context
    return input
  },
  webPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

const modelOnlyChain = RunnableSequence.from([
  modelOnlyPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

// Branching logic: local -> web -> model
const branchChain = RunnableLambda.from(async (input, options) => {
  const localResponse = await pdfChain.invoke(input, options)
  if (localResponse.notEnoughInformation) {
    // Local didn't have info, try web
    const webResponse = await webChain.invoke(input, options)
    if (webResponse.notEnoughInformation) {
      // Web didn't have info either, fallback to model
      const modelResponse = await modelOnlyChain.invoke(input, options)
      return modelResponse
    } else {
      return webResponse
    }
  } else {
    return localResponse
  }
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
