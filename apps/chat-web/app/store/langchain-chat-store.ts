import { ask, RetrievalFlow } from '@george-ai/langchain-chat'
import i18n from '../i18n'

export interface LangchainChatMessage {
  id: string
  sessionId: string
  sender: 'user' | 'bot'
  text: string
  source: string
  time: Date
  retrievalFlow: RetrievalFlow
}

const getDefaultChat = (
  retrievalFlow: RetrievalFlow = 'Sequential',
): LangchainChatMessage[] => [
  {
    id: '0',
    sessionId: (Math.random() + 1).toString(36).slice(7),
    sender: 'bot',
    text: i18n.t('greeting'),
    source: 'George AI',
    time: new Date(),
    retrievalFlow,
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
): Promise<LangchainChatMessage[]> => {
  const oldChat = getChat(sessionId)

  const langchainResult = await ask({
    question: message,
    sessionId,
    retrievalFlow,
  })

  const newMessages = [
    {
      id: Math.random().toString(),
      sessionId,
      sender: 'user',
      text: message,
      source: 'User',
      time: new Date(Date.now()),
      retrievalFlow,
    },
    {
      id: Math.random().toString(),
      sessionId,
      sender: 'bot',
      text: langchainResult.answer,
      source: langchainResult.source,
      time: new Date(Date.now()),
      retrievalFlow,
    },
  ] satisfies LangchainChatMessage[]

  const newChat = [...oldChat, ...newMessages]
  chatItems = [
    ...chatItems.filter((item) => item.sessionId !== sessionId),
    ...newChat,
  ]
  return newChat
}

const reset = (sessionId: string) => {
  const oldChat = getChat(sessionId)

  const lastFlow = oldChat.length
    ? oldChat[oldChat.length - 1].retrievalFlow
    : 'Sequential'

  const newChat = getDefaultChat(lastFlow)
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
