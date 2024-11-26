import * as fs from 'node:fs'

const possibleAnswers = [
  'I received your message!',
  'Thank you for your message!',
  'I love hearing from you!',
  'I appreciate your message!',
  "Don't know what to say, but thanks!",
  'Let me think about that...',
  'Good question, but how should I know?',
  'I am a bot, not a human!',
  'Beep boop beep!',
  'la la la',
  'Did you know that I am a bot?',
  'Have you tried turning it off and on again?',
]

export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
}

const filePath = 'chat.json'

const defaultChat: ChatMessage[] = [
  {
    id: '0',
    sender: 'bot',
    text: 'Hello! How can I help you today?',
  },
]

const getChat = async (): Promise<ChatMessage[]> =>
  JSON.parse(
    await fs.promises
      .readFile(filePath, 'utf8')
      .catch(() => JSON.stringify(defaultChat)),
  )

const sendChatMessage = async (message: string): Promise<ChatMessage[]> => {
  const oldChat = await getChat()

  const answer =
    possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]
  const newMessages: ChatMessage[] = [
    {
      id: Math.random().toString(),
      sender: 'user',
      text: message,
    },
    {
      id: Math.random().toString(),
      sender: 'bot',
      text: answer,
    },
  ]

  const newChat = [...oldChat, ...newMessages]
  await fs.promises.writeFile(filePath, JSON.stringify(newChat, undefined, 2))

  return newChat
}

export const chatStore = {
  getChat,
  sendChatMessage,
}
