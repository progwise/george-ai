import * as fs from 'node:fs'
import { ask } from '@george-ai/langchain-chat'

export interface LangchainChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  source: string
  time: Date
}

const filePath = 'langchain-chat.json'

const defaultChat: LangchainChatMessage[] = [
  {
    id: '0',
    sender: 'bot',
    text: 'Hallo, ich bin Ihr Reiseassistent. Wie kann ich Ihnen helfen?',
    source: 'George AI',
    time: new Date(),
  },
]

const getChat = async (): Promise<LangchainChatMessage[]> =>
  JSON.parse(
    await fs.promises
      .readFile(filePath, 'utf8')
      .catch(() => JSON.stringify(defaultChat)),
  )

let langchainSessionId = (Math.random() + 1).toString(36).slice(7)

const sendChatMessage = async (
  message: string,
): Promise<LangchainChatMessage[]> => {
  const oldChat = await getChat()
  const langchainResult = await ask({
    question: message,
    sessionId: langchainSessionId,
  })

  const newMessages: LangchainChatMessage[] = [
    {
      id: Math.random().toString(),
      sender: 'user',
      text: message,
      source: 'User',
      time: new Date(Date.now()),
    },
    {
      id: Math.random().toString(),
      sender: 'bot',
      text: langchainResult.answer,
      source: langchainResult.source,
      time: new Date(Date.now()),
    },
  ]

  const newChat = [...oldChat, ...newMessages]
  await fs.promises.writeFile(filePath, JSON.stringify(newChat, undefined, 2))

  return newChat
}

const reset = async (): Promise<void> => {
  langchainSessionId = (Math.random() + 1).toString(36).slice(7)
  await fs.promises.rm(filePath)
}

export const chatStore = {
  getChat,
  sendChatMessage,
  reset,
}
