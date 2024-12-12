import { ChatOpenAI } from '@langchain/openai'
import {
  RunnableSequence,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { combinedPrompt } from './prompts'
import { getMessageHistory } from './message-history'
import { getPDFContentForQuestion } from './memory-vectorstore'
// import { getPDFContentForQuestion } from './typesense-vectorstore'
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

const mainChain = RunnableSequence.from([
  async (input) => {
    const local_context = await getPDFContentForQuestion(input.question)
    const web_context = await getWebContent({ question: input.question })
    return { ...input, local_context, web_context }
  },
  combinedPrompt,
  model.withStructuredOutput(outputSchema, { strict: true }),
])

export const historyChain = new RunnableWithMessageHistory({
  runnable: mainChain,
  getMessageHistory,
  inputMessagesKey: 'question',
  outputMessagesKey: 'answer',
  historyMessagesKey: 'chat_history',
})
