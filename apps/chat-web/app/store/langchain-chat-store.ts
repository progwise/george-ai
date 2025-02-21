import { ask, RetrievalFlow } from '@george-ai/langchain-chat'
import i18n from '../i18n'
export type ModelChoice = 'gpt-4' | 'gemini-1.5-pro'

export interface LangchainChatMessage {
  id: string
  sessionId: string
  sender: 'user' | 'bot'
  text: string
  source: string
  time: Date
  retrievalFlow: RetrievalFlow
  modelChoice: ModelChoice
}

const getDefaultChat = (
  retrievalFlow: RetrievalFlow = 'Sequential',
  modelChoice: ModelChoice = 'gpt-4',
): LangchainChatMessage[] => [
  {
    id: '0',
    sessionId: (Math.random() + 1).toString(36).slice(7),
    sender: 'bot',
    text: i18n.t('greeting'),
    source: 'George AI',
    time: new Date(),
    retrievalFlow,
    modelChoice,
  },
]

let chatItems = getDefaultChat()

const getChat = (sessionId: string): LangchainChatMessage[] => {
  return chatItems.filter((item) => item.sessionId === sessionId)
}

const sendChatMessage = async (
  message: string,
  sessionId: string,
  retrievalFlow: RetrievalFlow,
  modelChoice: ModelChoice,
): Promise<LangchainChatMessage[]> => {
  const oldChat = getChat(sessionId)

  const langchainResult = await ask({
    question: message,
    sessionId,
    retrievalFlow,
    modelChoice,
  })

  const now = new Date()

  const newMessages: LangchainChatMessage[] = [
    {
      id: Math.random().toString(),
      sessionId,
      sender: 'user',
      text: message,
      source: 'User',
      time: now,
      retrievalFlow,
      modelChoice,
    },
    {
      id: Math.random().toString(),
      sessionId,
      sender: 'bot',
      text: langchainResult.answer,
      source: langchainResult.source,
      time: now,
      retrievalFlow,
      modelChoice,
    },
  ]

  const newChat = [...oldChat, ...newMessages]
  chatItems = [
    ...chatItems.filter((item) => item.sessionId !== sessionId),
    ...newChat,
  ]
  return newChat
}

const reset = (sessionId: string) => {
  const oldChat = getChat(sessionId)
  if (!oldChat.length) {
    const newChat = getDefaultChat()
    chatItems = [
      ...chatItems.filter((item) => item.sessionId !== sessionId),
      ...newChat,
    ]
    return newChat
  }

  const lastMessage = oldChat[oldChat.length - 1]
  const lastFlow = lastMessage.retrievalFlow
  const lastModel = lastMessage.modelChoice

  const newChat = getDefaultChat(lastFlow, lastModel)
  chatItems = [
    ...chatItems.filter((item) => item.sessionId !== sessionId),
    ...newChat,
  ]
  return newChat
}

const getNewChat = () => {
  const newChat = getDefaultChat()
  chatItems = [...chatItems, ...newChat]
  return newChat
}

export const chatStore = {
  getNewChat,
  getChat,
  sendChatMessage,
  reset,
}
