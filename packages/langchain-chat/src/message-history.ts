import { ChatMessageHistory } from 'langchain/stores/message/in_memory'

const messageHistories = new Map<string, ChatMessageHistory>()

export const getMessageHistory = (sessionId: string): ChatMessageHistory => {
  if (!messageHistories.has(sessionId)) {
    messageHistories.set(sessionId, new ChatMessageHistory())
  }
  const history = messageHistories.get(sessionId) as ChatMessageHistory
  return history
}
