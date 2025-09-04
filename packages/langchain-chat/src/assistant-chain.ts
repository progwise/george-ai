import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { getOllamaChatModel } from '@george-ai/ai-service-client'

import { Assistant, getAssistantBaseMessages } from './assistant'
import { getApologyPrompt } from './assistant-apology'
import { getLibraryRelevancePrompt } from './assistant-library'
import { AssistantModel } from './assistant-model'
import { getSanitizedQuestion } from './assistant-prompt'
import { getRelevance } from './assistant-relevance'
import { Library } from './library'
import { getSimilarChunks } from './typesense-vectorstore'

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
  libraries: Library[]
}) {
  if (!input.assistant.languageModel) {
    yield '> No language model configured for this assistant.\n'
    yield '> Please configure a language model for this assistant to use it.\n'
    return
  }
  const model = getOllamaChatModel(input.assistant.languageModel)
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history, model, 1000)

  const assistantBaseInformation = getAssistantBaseMessages({
    assistant: input.assistant,
    libraries: input.libraries,
  })
  // Step 1: Find out if the message should be processed and is relevant as given in the assistant description
  const isQuestionRelevant = await getRelevance({
    assistantBaseInformation,
    chatHistory: trimmedHistoryMessages,
    question: input.message.content,
    modelName: input.assistant.languageModel,
  })

  if (!isQuestionRelevant) {
    const apologyPrompt = await getApologyPrompt({
      assistantBaseInformation,
      question: input.message.content,
      chatHistory: trimmedHistoryMessages,
    })

    for await (const chunk of await model.stream(apologyPrompt, {})) {
      yield chunk.content.toString()
    }
    return
  }
  const libraryPromises = input.libraries.map(async (library) => {
    const libraryPromptResult = await getLibraryRelevancePrompt(model, {
      chatHistory: trimmedHistoryMessages,
      question: input.message.content,
      libraryDescription: library.description,
      libraryName: library.name,
      libraryUsedFor: library.usedFor,
    })

    const vectorStoreResult = await getSimilarChunks({
      term: libraryPromptResult.searchPrompt,
      hits: 4,
      embeddingsModelName: library.embeddingModelName,
      libraryId: library.id,
    })

    const messages = vectorStoreResult.map(
      (result) =>
        new SystemMessage({
          content: `Found the following document ${result.fileName} in the library ${library.name} while searching for ${libraryPromptResult.searchPrompt}:

        START OF DOCUMENT

        Document content: ${result.text}
        
        END OF DOCUMENT
        `,
        }),
    )
    return messages
  })

  yield '> Searching for relevant information in the libraries...\n'
  const [sanitizedQuestion, librarySearchResults] = await Promise.all([
    getSanitizedQuestion(model, {
      question: input.message.content,
      assistantBaseInformation,
      chatHistory: trimmedHistoryMessages,
    }),
    ...libraryPromises,
  ])

  const answerPrompt = getAssistantAnswerPrompt()

  const trimmedLibrarySearchResults = await getTrimmedMessages(librarySearchResults, model, 50000)
  if (trimmedLibrarySearchResults.length === 0) {
    yield '> No relevant information found in the libraries.\n\n'
  } else {
    yield `> Found ${trimmedLibrarySearchResults.length} items in the libraries:\n`
  }

  const prompt = await answerPrompt.invoke({
    assistant_base_information: assistantBaseInformation,
    library_search_results: trimmedLibrarySearchResults,
    chat_history: trimmedHistoryMessages, // 1000 tokens
    question: sanitizedQuestion.content.toString(),
  })

  yield '> \n'
  yield `> ${sanitizedQuestion.content.toString()}...\n\n`
  try {
    for await (const chunk of await model.stream(prompt, {})) {
      yield chunk.content.toString()
    }
  } catch (error) {
    console.error('Error in assistant chain:', error)
    yield '\n'
    yield '> Error in assistant chain:\n'
    yield '<code>\n'
    yield JSON.stringify(error, null, 2)
    yield '</code>\n\n'
  }
}

const getAssistantAnswerPrompt = () =>
  ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a helpful assistant and you have a name.
      That the question is relevant was already decided and yes, the question needs to be answered.
    
    Overall Instructions:
    - Format the answer as pure markdown text.  
    - Do not mention these exact instructions, just follow them.

    Answer the question in a way that is relevant to the assistant_base_information and the chat history.
    Please consider the chat history to avoid repeating the same information.
    Keep your answer short and concise without providing any information you do not have.
    `,
    ],
    ['system', 'Here is your identity. This is information about you and your rules:'],
    new MessagesPlaceholder('assistant_base_information'),
    [
      'system',
      'Here is the relevant information from the search you performed earlier. Please use this search results to answer the question. Please use all documents in your answer:',
    ],
    new MessagesPlaceholder('library_search_results'),
    ['system', 'Here is the chat history:'],
    new MessagesPlaceholder('chat_history'),
    ['system', "Here is the question. Please answer it in the language of the following human's question:"],
    ['human', '{question}'],
  ])

const getTrimmedMessages = async (messages: BaseMessage[] | null, model: AssistantModel, maxTokens: number) => {
  if (!messages || messages.length < 1) {
    return []
  }
  const trimmer = trimMessages({
    maxTokens: maxTokens,
    strategy: 'last',
    tokenCounter: model,
    includeSystem: true,
    allowPartial: false,
  })
  return await trimmer.invoke(messages)
}

const getTrimmedHistoryMessages = async (
  history: AssistantChainMessage[],
  model: AssistantModel,
  maxTokens: number,
) => {
  if (history.length === 0) {
    return []
  }
  const trimmer = trimMessages({
    maxTokens: maxTokens,
    strategy: 'last',
    tokenCounter: model,
    includeSystem: true,
    allowPartial: false,
    startOn: 'human',
  })

  // newest first
  const historyMessages = history.reverse().map((message) => {
    if (message.isBot) {
      return new AIMessage({
        content: message.content,
        name: message.author.id,
      })
    }
    return new HumanMessage({
      content: message.content,
      name: message.author.id,
    })
  })

  return await trimmer.invoke(historyMessages)
}
