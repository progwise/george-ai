import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
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

const modelOpenAI = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
})

const modelGoogle = new ChatGoogleGenerativeAI({
  model: 'gemini-pro',
  maxOutputTokens: 2048,
})

interface ModelOptions {
  configurable?: {
    modelType?: 'OpenAI' | 'Google'
  }
}

const getModel = (options: ModelOptions) => {
  const modelType = options?.configurable?.modelType ?? 'OpenAI'
  return modelType === 'Google' ? modelGoogle : modelOpenAI
}

const historyToQueryChain = RunnableSequence.from([
  (input) => ({
    chat_history: input.chat_history,
    question: input.question,
  }),
  searchQueryPrompt,
  (input, options) => getModel(options).invoke(input),
  (modelResponse) => modelResponse.text,
])

const pdfChain = RunnableSequence.from([
  localPrompt,
  (input, options) =>
    getModel(options)
      .withStructuredOutput(outputSchema, { strict: true })
      .invoke(input),
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
  (input, options) =>
    getModel(options)
      .withStructuredOutput(outputSchema, { strict: true })
      .invoke(input),
])

const apologyChainOnlyLocal = RunnableSequence.from([
  apologyPromptOnlyLocal,
  (input, options) =>
    getModel(options)
      .withStructuredOutput(outputSchema, { strict: true })
      .invoke(input),
])

const apologyChainOnlyWeb = RunnableSequence.from([
  apologyPromptOnlyWeb,
  (input, options) =>
    getModel(options)
      .withStructuredOutput(outputSchema, { strict: true })
      .invoke(input),
])

const apologyChainLocalAndWeb = RunnableSequence.from([
  apologyPromptLocalAndWeb,
  (input, options) =>
    getModel(options)
      .withStructuredOutput(outputSchema, { strict: true })
      .invoke(input),
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
    context: await getPDFContentForQuestion(input.searchQuery),
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
