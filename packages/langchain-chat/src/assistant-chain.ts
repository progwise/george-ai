import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { Assistant } from './assistant'
import { getApologyPrompt } from './assistant-apology'
import { getLibraryPrompt } from './assistant-library'
import { getModel } from './assistant-model'
import { getRelevance } from './assistant-relevance'
import { similaritySearch } from './typesense-vectorstore'
import { chooseK } from './vec-utils'

export interface AssistantChainMessage {
  id: string
  content: string
  author: { id: string; name?: string | null }
  isBot: boolean
}

export async function* askAssistantChain(input: {
  message: AssistantChainMessage
  history: AssistantChainMessage[]
  assistant: Assistant
  libraries: { id: string; name: string; description: string }[]
}) {
  const model = getModel(input.assistant.languageModel)
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history)

  const assistantBaseInformation: BaseMessage[] = [
    new SystemMessage({
      content: `You are a helpful assistant named ${input.assistant.name}. ${input.assistant.description}`,
    }),
    ...input.libraries.map(
      (lib) =>
        new SystemMessage({
          content: `You have access to library ${lib.name}: ${lib.description}`,
        }),
    ),
    ...input.assistant.baseCases.map(
      (baseCase) =>
        new SystemMessage({
          content: `Conditional instruction: if (${baseCase.condition}) then ${baseCase.instruction}`,
        }),
    ),
  ]

  const libraryBaseInformation: BaseMessage[] = input.libraries.map(
    (lib) => new SystemMessage({ content: `Library ${lib.name}: ${lib.description}` }),
  )

  // 1) Relevance check
  const isRelevant = await getRelevance({
    assistantBaseInformation,
    libraryBaseInformation,
    chatHistory: trimmedHistoryMessages,
    question: input.message.content,
    modelName: input.assistant.languageModel,
  })

  if (!isRelevant) {
    const apology = await getApologyPrompt({
      assistantBaseInformation,
      question: input.message.content,
      chatHistory: trimmedHistoryMessages,
    })
    for await (const chunk of await model.stream(apology, {})) {
      yield chunk.content.toString()
    }
    return
  }

  const libraryUsageMessages: BaseMessage[] = []

  // 2) Library search with adaptive k
  for (const lib of input.libraries) {
    libraryUsageMessages.push(new SystemMessage({ content: `Checking library: ${lib.name}`, name: 'assistant' }))

    const libPrompt = await getLibraryPrompt({
      assistantBaseInformation,
      libraryBaseInformation,
      chatHistory: trimmedHistoryMessages,
      question: input.message.content,
    })
    const libResult = await model.invoke(libPrompt, {})
    const libJson = JSON.parse(libResult.content.toString())
    if (!libJson.isRelevant) {
      yield `Library ${lib.name} not relevant.\n\n`
      continue
    }

    yield `Searching ${lib.name} with prompt: ${libJson.searchPrompt}\n\n`

    // Preflight to count
    const sample = await similaritySearch(libJson.searchPrompt, lib.id, 1)
    const { k } = chooseK(libJson.searchPrompt, sample.length)

    // Actual retrieval
    const docs = await similaritySearch(libJson.searchPrompt, lib.id, k)
    const resultString = docs.map((d) => `----\nDocument: ${d.docName}\n${d.pageContent}\n----`).join('\n')

    libraryUsageMessages.push(
      new SystemMessage({ content: `Found in ${lib.name}:\n${resultString}`, name: 'assistant' }),
    )
  }

  // 3) Final answer
  const answerPrompt = await getAssistantAnswerPrompt().invoke({
    assistant_base_information: assistantBaseInformation,
    library_search_results: libraryUsageMessages,
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
  })
  for await (const chunk of await model.stream(answerPrompt, {})) {
    yield chunk.content.toString()
  }
}

const getAssistantAnswerPrompt = () =>
  ChatPromptTemplate.fromMessages([
    ['system', `You are a helpful assistant. Answer using only the library search results above.`],
    new MessagesPlaceholder('assistant_base_information'),
    new MessagesPlaceholder('library_search_results'),
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ])

async function getTrimmedHistoryMessages(history: AssistantChainMessage[]) {
  if (history.length === 0) return []
  const trimmer = trimMessages({ maxTokens: 10, strategy: 'last', tokenCounter: () => 1 })
  const msgs = history.map((h) =>
    h.isBot
      ? new AIMessage({ content: h.content, name: h.author.id })
      : new HumanMessage({ content: h.content, name: h.author.id }),
  )
  return await trimmer.invoke(msgs)
}
