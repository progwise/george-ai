import { ChatMessageHistory } from 'langchain/stores/message/in_memory'

const messageHistories = new Map<string, ChatMessageHistory>()

export const getMessageHistory = (sessionId: string): ChatMessageHistory => {
  const history = messageHistories.get(sessionId)
  if (history) {
    return history
  }
  const newHistory = new ChatMessageHistory()
  messageHistories.set(sessionId, newHistory)
  return newHistory
}
