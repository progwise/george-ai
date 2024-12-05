import { ChatOpenAI } from '@langchain/openai'

import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { localPrompt, webPrompt } from './prompts'
import { getMessageHistory } from './message-history'
import { getPDFContentForQuestion } from './pdf-vectorstore'
import { getWebContent } from './web-vectorstore'
import * as z from 'zod'

const outputSchema = z.object({
  answer: z
    .string()
    .describe(
      'The answer to the human question in the the model output without any hidden special characters.',
    ),
  source: z
    .string()
    .describe(
      'The source field states in a single word where the final answer came from. State either "local" if the answer is derived from the context or "web".',
    ),
  notEnoughInformation: z
    .boolean()
    .describe(
      'if the model did not have enough information to answer the question. Default is false',
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

// process web search and model output

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

// branching between pdf and web chains
const branchChain = RunnableLambda.from(async (input, options) => {
  const localResponse = await pdfChain.invoke(input, options)
  if (localResponse.notEnoughInformation) {
    const webResponse = await webChain.invoke(input, options)

    return {
      ...webResponse,
    }
  } else {
    return {
      ...localResponse,
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
