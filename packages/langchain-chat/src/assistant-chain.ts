import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { Assistant } from './assistant'
import { getApologyPrompt } from './assistant-apology'
import { getLibraryPrompt } from './assistant-library'
import { getModel } from './assistant-model'
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
  }[]
}) {
  const model = getModel(input.assistant.languageModel)
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history)

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
      description: ${library.description}`,
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
    console.log('libraryPromptResult', libraryPromptResult.content.toString())
    const libraryPromptResultJson = JSON.parse(libraryPromptResult.content.toString())

    if (!libraryPromptResultJson.isRelevant) {
      yield `library ${library.name} is not relevant\n\n`
      continue
    }

    yield `searching library ${library.name} with prompt ${libraryPromptResultJson.searchPrompt}\n\n`
    const vectorStoreResult = await similaritySearch(libraryPromptResultJson.searchPrompt, library.id)
    const vectorStoreResultString = vectorStoreResult
      .map(
        (result) => `
        ----
      Document name: ${result.docName}
      Document content: ${result.pageContent}
      ----
    `,
      )
      .join('\n')
    libraryUsageMessages.push(
      new SystemMessage({
        content: `Found the following in the library ${library.name}:
        ${vectorStoreResultString}`,
        name: 'assistant',
      }),
    )
  }

  const prompt = await getAssistantAnswerPrompt().invoke({
    assistant_base_information: assistantBaseInformation,
    library_search_results: libraryUsageMessages,
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
  })

  // TODO: Yield the prompt and the answer separately
  // yield 'Hier kommt mein Prompt...\n\n'
  // yield prompt.toString()
  // yield '\n\n...und hier meine Antwort...\n\n'

  for await (const chunk of await model.stream(prompt, {})) {
    yield chunk.content.toString()
  }
}

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

const getTrimmedHistoryMessages = async (history: AssistantChainMessage[]) => {
  if (history.length === 0) {
    return []
  }
  const trimmer = trimMessages({
    maxTokens: 10,
    strategy: 'last',
    tokenCounter: (msgs) => msgs.length,
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
