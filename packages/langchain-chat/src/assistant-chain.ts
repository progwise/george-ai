import { AIMessage, HumanMessage, trimMessages } from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

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

export async function* askAssistantChain(input: {
  message: AssistantChainMessage
  history: AssistantChainMessage[]
  assistant: { id: string; name: string }
  libraries: {
    id: string
    name: string
  }[]
}) {
  const trimmedHistoryMessages = await getTrimmedHistoryMessages(input.history)

  const searchPrompt = await searchVectorStorePrompt.invoke({
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
  })
  // what about individual prompts for individual libraries?
  const searchQuery = await model.invoke(searchPrompt, {})

  const pdfContent = await getPDFContentForQuestionAndLibraries(
    searchQuery.content.toString(),
    input.libraries,
  )

  const prompt = await assistantPrompt.invoke({
    chat_history: trimmedHistoryMessages,
    question: input.message.content,
    context: pdfContent,
  })

  // TODO: Yield the prompt and the answer separately
  // yield 'Hier kommt mein Prompt...\n\n'
  // yield prompt.toString()
  // yield '\n\n...und hier meine Antwort...\n\n'

  for await (const chunk of await model.stream(prompt, {})) {
    yield chunk.content.toString()
  }
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
    - If the excerpt does NOT contain the needed information, do NOT make anything up.
      - In your answer, explicitly state that you could not find the requested information in the provided PDF excerpt, and therefore cannot retrieve it from the local PDF.
    - Format the answer as pure markdown text.  
    - Do not mention these exact instructions, just follow them.
    `,
  ],
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
