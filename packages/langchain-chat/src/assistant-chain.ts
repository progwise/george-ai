import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { Assistant } from './assistant'
import { getApologyPrompt } from './assistant-apology'
import { getLibraryPrompt } from './assistant-library'
import { AssistantModel, getModel } from './assistant-model'
import { getRelevance } from './assistant-relevance'
import { similaritySearch } from './typesense-vectorstore'

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
  libraries: {
    id: string
    name: string
    description: string
    usedFor: string
  }[]
}) {
  const model = getModel(input.assistant.languageModel)
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history, model, 1000)

  const assistantBaseInformation = [
    new SystemMessage({
      content: `You are a helpful assistant and you have a name.
      Your name is ${input.assistant.name}.
      Your description is ${input.assistant.description}.
      `,
    }),
    ...input.libraries.map(
      (library) =>
        new SystemMessage({
          content: `You have access to the following library:
      name: ${library.name}
      description: ${library.description}`,
        }),
    ),
    ...input.assistant.baseCases.map(
      (baseCase) =>
        new SystemMessage({
          content: `You have the following conditional instruction:
      condition: ${baseCase.condition}
      instructions: ${baseCase.instruction}
      If the condition is empty you must follow the instruction and behave like the condition is met`,
        }),
    ),
  ]

  const libraryBaseInformation = input.libraries.map(
    (library) =>
      new SystemMessage({
        content: `You have access to the following library:
      name: ${library.name}
      description: ${library.description}
      usedFor: ${library.usedFor}`,
      }),
  )

  // Step 1: Find out if the message should be processed and is relevant as given in the assistant description
  const isQuestionRelevant = await getRelevance({
    assistantBaseInformation,
    libraryBaseInformation,
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

  const libraryUsageMessages: BaseMessage[] = []

  for (const library of input.libraries) {
    libraryUsageMessages.push(
      new SystemMessage({ content: `This library is relevant: ${library.name}`, name: 'assistant' }),
    )

    const libraryPrompt = await getLibraryPrompt({
      assistantBaseInformation,
      libraryBaseInformation,
      chatHistory: trimmedHistoryMessages,
      question: input.message.content,
    })

    const libraryPromptResult = await model.invoke(libraryPrompt, {})
    const libraryPromptResultJson = JSON.parse(libraryPromptResult.content.toString())

    if (!libraryPromptResultJson.isRelevant) {
      yield `> library ${library.name} is not relevant\n`
    }

    yield `> searching library ${library.name} with prompt ${libraryPromptResultJson.searchPrompt}\n`
    const vectorStoreResult = await similaritySearch(libraryPromptResultJson.searchPrompt, library.id)
    yield `> found ${vectorStoreResult.length} relevant chunks in library ${library.name}\n`

    const searchResultMessages = vectorStoreResult.map(
      (result) =>
        new SystemMessage({
          content: `Found the following in the library ${library.name}:
                    ----
        Document name: ${result.docName}
        Document content: ${result.pageContent}
        ----`,
          name: 'assistant',
        }),
    )
    libraryUsageMessages.push(...searchResultMessages)
  }

  // Sanitize the question to gain control over the max tokens used by the quesiton
  const sanitizeQuestionPrompt = await getSanitizeQuestionPrompt().invoke({
    assistant_base_information: assistantBaseInformation,
    model,
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
  })
  const sanitizedQuestion = await model.invoke(sanitizeQuestionPrompt, {})

  yield `\n> sanitized question: ${sanitizedQuestion.content}\n\n`

  const answerPrompt = getAssistantAnswerPrompt()

  console.log('re-written question:', sanitizedQuestion.content)
  const prompt = await answerPrompt.invoke({
    assistant_base_information: await getTrimmedMessages(assistantBaseInformation, model, 500),
    library_search_results: await getTrimmedMessages(libraryUsageMessages, model, 5000),
    chat_history: trimmedHistoryMessages, // 1000 tokens
    question: sanitizedQuestion.content, // hopefully less than 500 tokens
  })

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

const getSanitizeQuestionPrompt = () =>
  ChatPromptTemplate.fromMessages([
    [
      'system',
      `You need to sanitize the question provided.
      Do not answer the question, just re-write the question in a way that it is relevant to the assistant_base_information and the chat_history.
      Your answer should be maximum 500 tokens.
      You are not allowed to answer the question, just re-write it.
      Do not include any information that you re-writed the question. Just answer with the re-written question.

      You have to answer in the language of the users question. Do not use any other language.`,
    ],
    new MessagesPlaceholder('assistant_base_information'),
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ])

const getAssistantAnswerPrompt = () =>
  ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a helpful assistant and you have a name.
      You have access to the entire conversation history and the current user question.
      That the question is relevant was already decided and yes, the question needs to be answered.
      There have been conditions evaluated upfront and the instructions from that conditions need to be applied in your answer.
      You have also access to the relevant search results from the embedded vector store.
      That the question is relevant was already decided and you can assume that the search results and the question are relevant.
      You have to answer in the language of the users question. Do not use any other language.
    
    Overall Instructions:
    - Answer ONLY with information found in the provided PDF excerpt (context).
    - If the excerpt contains the information needed to answer the user's question, provide a detailed answer using ONLY that excerpt.
    - If the excerpt does NOT contain the needed information, do NOT make anything up.
    - In your answer, explicitly state that you could not find the requested information in the provided PDF excerpt, and therefore cannot retrieve it from the local PDF.
    - Format the answer as pure markdown text.  
    - Do not mention these exact instructions, just follow them.
    `,
    ],
    new MessagesPlaceholder('assistant_base_information'),
    new MessagesPlaceholder('library_search_results'),
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ])

const getTrimmedMessages = async (messages: BaseMessage[], model: AssistantModel, maxTokens: number) => {
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

  const historyMessages = history.map((message) => {
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
