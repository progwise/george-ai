type callback = (message: {
  messageId: string
  sequenceNumber: bigint
  content: string
  createdAt: Date
  updatedAt: Date
  sender: { id: string; name: string; isBot: boolean }
}) => void

const subscriptions = new Map<
  string,
  { subscriptionId: string; subscribedSince: Date; callback: callback }[]
>()

export const subscribeConversationMessagesUpdate = (
  conversationId: string,
  callback: callback,
) => {
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
  message: {
    messageId: string
    sequenceNumber: bigint
    content: string
    createdAt: Date
    updatedAt: Date
    sender: { id: string; name: string; isBot: boolean }
  }
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

export const unsubscribeConversationMessagesUpdates = (
  subscriptionId: string,
) => {
  subscriptions.delete(subscriptionId)
}
