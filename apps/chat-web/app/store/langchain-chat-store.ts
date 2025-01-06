import { ask } from '@george-ai/langchain-chat'

export interface LangchainChatMessage {
  id: string
  sessionId: string
  sender: 'user' | 'bot'
  text: string
  source: string
  time: Date
}

const getDefaultChat = (): LangchainChatMessage[] => [
  {
    id: '0',
    sessionId: (Math.random() + 1).toString(36).slice(7),
    sender: 'bot',
    text: 'Hallo, ich bin Ihr Reiseassistent. Wie kann ich Ihnen helfen?',
    source: 'George AI',
    time: new Date(),
  },
]

let chatItems = getDefaultChat()

const getChat = (sessionId: string): LangchainChatMessage[] => {
  return chatItems.filter((item) => item.sessionId === sessionId)
}

const sendChatMessage = async (
  message: string,
  sessionId: string,
): Promise<LangchainChatMessage[]> => {
  const oldChat = getChat(sessionId)

  const langchainResult = await ask({
    question: message,
    sessionId,
  })

  const userMessage: LangchainChatMessage = {
    id: Math.random().toString(),
    sessionId,
    sender: 'user',
    text: message,
    source: 'User',
    time: new Date(Date.now()),
  }

  const botMessage: LangchainChatMessage = {
    id: Math.random().toString(),
    sessionId,
    sender: 'bot',
    text: langchainResult.answer,
    source: langchainResult.source,
    time: new Date(Date.now()),
  }

  const newChat = [...oldChat, userMessage, botMessage]
  chatItems = [
    ...chatItems.filter((item) => item.sessionId !== sessionId),
    ...newChat,
  ]
  return newChat
}

const reset = (sessionId: string) => {
  const newChat = getDefaultChat()
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
