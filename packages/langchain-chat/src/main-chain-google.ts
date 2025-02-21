import {
  RunnableSequence,
  RunnableLambda,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import {
  localPrompt,
  webPrompt,
  apologyPromptOnlyLocal,
  apologyPromptOnlyWeb,
  apologyPromptLocalAndWeb,
  searchQueryPrompt,
} from './prompts'
import { getMessageHistory } from './message-history'
// import { getPDFContentForQuestion } from './memory-vectorstore'
// import { getPDFContentForQuestion } from './typesense-vectorstore'
import { getWebContent } from './web-vectorstore'

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

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

const modelGoogle = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-pro',
  temperature: 0,
  maxRetries: 2,
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const googleChatChain = RunnableSequence.from([
  async (input) => ({
    question: input.question,
  }),
  async (input) => {
    await delay(1000) // Add a delay of 1 second between requests
    return modelGoogle.invoke(input)
  },
])

const historyToQueryChain = RunnableSequence.from([
  (input) => ({
    chat_history: input.chat_history,
    question: input.question,
  }),
  searchQueryPrompt,
  modelGoogle,
  (modelResponse) => modelResponse.text,
])

const pdfChain = RunnableSequence.from([
  localPrompt,
  modelGoogle.withStructuredOutput(outputSchema, { strict: true }),
])

const webChain = RunnableSequence.from([
  async (input, options) => {
    const sessionId = options?.configurable?.sessionId
    const messageHistory = sessionId
      ? await getMessageHistory(sessionId).getMessages()
      : []
    const historyContent = messageHistory.map((m) => m.content).join('\n')
    const combinedQuery =
      historyContent.trim().length > 0
        ? `Relevant conversation history:\n${historyContent}\n\nUser's current question:\n${input.question}`
        : input.question

    const context = await getWebContent({ question: combinedQuery })
    return { ...input, context }
  },
  webPrompt,
  modelGoogle.withStructuredOutput(outputSchema, { strict: true }),
])

const apologyChainOnlyLocal = RunnableSequence.from([
  apologyPromptOnlyLocal,
  modelGoogle.withStructuredOutput(outputSchema, { strict: true }),
])

const apologyChainOnlyWeb = RunnableSequence.from([
  apologyPromptOnlyWeb,
  modelGoogle.withStructuredOutput(outputSchema, { strict: true }),
])

const apologyChainLocalAndWeb = RunnableSequence.from([
  apologyPromptLocalAndWeb,
  modelGoogle.withStructuredOutput(outputSchema, { strict: true }),
])

const branchChain = RunnableLambda.from(
  async (input: { question: string }, options) => {
    const retrievalFlow = options?.configurable?.retrievalFlow ?? 'Sequential'

    switch (retrievalFlow) {
      case 'Only Local': {
        const localResponse = await pdfChain.invoke(input, options)
        if (!localResponse.notEnoughInformation) {
          return localResponse
        }
        return apologyChainOnlyLocal.invoke(input, options)
      }

      case 'Only Web': {
        const webResponse = await webChain.invoke(input, options)
        if (!webResponse.notEnoughInformation) {
          return webResponse
        }
        return apologyChainOnlyWeb.invoke(input, options)
      }

      case 'Sequential': {
        const localResponse = await pdfChain.invoke(input, options)
        if (!localResponse.notEnoughInformation) {
          return localResponse
        }
        const webResponse = await webChain.invoke(input, options)
        if (!webResponse.notEnoughInformation) {
          return webResponse
        }
        return apologyChainLocalAndWeb.invoke(input, options)
      }

      case 'Parallel': {
        const [localResponse, webResponse] = await Promise.all([
          pdfChain.invoke(input, options),
          webChain.invoke(input, options),
        ])

        if (!localResponse.notEnoughInformation) {
          return localResponse
        }
        if (!webResponse.notEnoughInformation) {
          return webResponse
        }
        return apologyChainLocalAndWeb.invoke(input, options)
      }

      default: {
        return apologyChainLocalAndWeb.invoke(input, options)
      }
    }
  },
)

const mainChain = RunnableSequence.from([
  async (input) => {
    const searchQuery = await historyToQueryChain.invoke({
      question: input.question,
      chat_history: input.chat_history,
    })

    return { ...input, searchQuery }
  },

  async (input) => ({
    ...input,

    context: await input.searchQuery,
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

export const googleChat = googleChatChain
