interface EnrichmentQueueUpdate {
  queueItemId: string
  listId: string
  fieldId: string
  fileId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string | null
  computedValue?: {
    valueString?: string | null
    valueNumber?: number | null
    valueDate?: Date | null
    valueBoolean?: boolean | null
  } | null
}

type EnrichmentQueueCallback = (update: EnrichmentQueueUpdate) => void

interface EnrichmentQueueSubscription {
  subscriptionId: string
  subscribedSince: Date
  callback: EnrichmentQueueCallback
}

const subscriptions = new Map<string, EnrichmentQueueSubscription[]>()

export const subscribeEnrichmentQueueUpdates = (listId: string, callback: EnrichmentQueueCallback): string => {
  let subscriptionId = Math.random().toString(36)
  while (subscriptions.has(subscriptionId)) {
    subscriptionId = Math.random().toString(36)
  }

  const existingSubscriptions = subscriptions.get(listId) || []
  subscriptions.set(listId, [...existingSubscriptions, { subscriptionId, subscribedSince: new Date(), callback }])

  return subscriptionId
}

export const callEnrichmentQueueUpdateSubscriptions = ({
  listId,
  update,
}: {
  listId: string
  update: EnrichmentQueueUpdate
}) => {
  const subscribers = subscriptions.get(listId)

  if (!subscribers) {
    return Promise.resolve()
  }

  const allPromises = subscribers.map(({ callback }) => {
    return new Promise((resolve) => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in enrichment queue subscription callback:', error)
      }
      resolve({})
    })
  })

  return Promise.all(allPromises)
}

export const unsubscribeEnrichmentQueueUpdates = ({
  listId,
  subscriptionId,
}: {
  listId: string
  subscriptionId: string
}) => {
  const subscribers = subscriptions.get(listId)
  if (subscribers) {
    const filtered = subscribers.filter((s) => s.subscriptionId !== subscriptionId)
    if (filtered.length > 0) {
      subscriptions.set(listId, filtered)
    } else {
      subscriptions.delete(listId)
    }
  }
}
