interface Message {
  messageId: string
  sequenceNumber: bigint
  content: string
  createdAt: Date
  updatedAt: Date
  sender: { id: string; name: string; isBot: boolean; assistantId?: string }
}
type callback = (message: Message) => void

interface Subscription {
  subscriptionId: string
  subscribedSince: Date
  callback: callback
}

const subscriptions = new Map<string, Subscription[]>()

export const subscribeConversationMessagesUpdate = (conversationId: string, callback: callback) => {
  let subscriptionId = Math.random().toString(36)
  while (subscriptions.has(subscriptionId)) {
    subscriptionId = Math.random().toString(36)
  }

  subscriptions.set(conversationId, [
    ...(subscriptions.get(conversationId) || []),
    { subscriptionId, subscribedSince: new Date(), callback },
  ])

  return subscriptionId
}

export const callConversationMessagesUpdateSubscriptions = ({
  conversationId,
  message,
}: {
  conversationId: string
  message: Message
}) => {
  const subscribers = subscriptions.get(conversationId)

  if (!subscribers) {
    return Promise.resolve()
  }
  const allPromises = subscribers.map(({ callback }) => {
    return new Promise((resolve) => {
      callback(message)
      resolve({})
    })
  })
  return Promise.all(allPromises)
}

export const unsubscribeConversationMessagesUpdates = ({
  conversationId,
  subscriptionId,
}: {
  conversationId: string
  subscriptionId: string
}) => {
  const subscribers = subscriptions.get(conversationId)
  subscriptions.set(conversationId, subscribers?.filter((s) => s.subscriptionId !== subscriptionId) || [])
}
