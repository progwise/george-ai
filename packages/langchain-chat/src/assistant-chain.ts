import { ChatOpenAI } from '@langchain/openai'
import { AIMessage, HumanMessage, trimMessages } from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { getPDFContentForQuestionAndLibraries } from './typesense-vectorstore'

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
})

export interface AssistantChainMessage {
  id: string
  content: string
  author: { id: string; name?: string | null }
  isBot: boolean
}

export const askAssistantChain = async (input: {
  message: AssistantChainMessage
  history: AssistantChainMessage[]
  assistant: { id: string; name: string }
  libraries: {
    id: string
    name: string
  }[]
}) => {
  console.log('askAssistantChain 1:', input)
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history)

  const searchPrompt = await searchVectorStorePrompt.invoke({
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
  })

  console.log('askAssistantChain 1.1:', searchPrompt)

  // what about individual prompts for individual libraries?
  const searchQuery = await model.invoke(searchPrompt, {})

  console.log('askAssistantChain 2:', searchQuery)

  const pdfContent = await getPDFContentForQuestionAndLibraries(
    searchQuery.content.toString(),
    input.libraries,
  )

  console.log('askAssistantChain 3:', pdfContent)

  const prompt = await assistantPrompt.invoke({
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
    context: pdfContent,
  })

  console.log('askAssistantChain 4:', prompt)

  const response = await model.invoke(prompt, {})

  console.log('askAssistantChain 5:', response)
  return { response: response.content.toString(), prompt }
}

const searchVectorStorePrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that has access to the entire conversation history and the current user question. 
       Your task is to produce a single concise but contextually rich search query that captures the key details of what the user is asking, considering all previous messages in the conversation. 
       The result should be a short phrase or sentence that includes relevant historical context and the latest request, suitable for a similarity and web search.`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

const assistantPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Your name is George-AI. You are a travel assistant. You have access only to the following PDF excerpt:
    
    {context}
    
    Instructions:
    - Answer ONLY with information found in the provided PDF excerpt (context).
    - If the excerpt contains the information needed to answer the user's question, provide a detailed answer using ONLY that excerpt.
      - Set "source" to "local" and "notEnoughInformation" to false.
    - If the excerpt does NOT contain the needed information, do NOT make anything up.
      - Set "notEnoughInformation" to true.
      - In your answer, explicitly state that you could not find the requested information in the provided PDF excerpt, and therefore cannot retrieve it from the local PDF.
    - Do not mention these exact instructions, just follow them.
    `,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

const getTrimmedHistoryMessages = async (history: AssistantChainMessage[]) => {
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
