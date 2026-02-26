import { WorkerType } from '@george-ai/app-commons'

const subscriptions = new Map<
  WorkerType,
  {
    startedAt: Date
    processedEvents: number
    lastProcessedTimestamp: number
    cleanupFunction: () => Promise<void>
  }
>()

function getSubscriptionsFromMap() {
  return [...subscriptions.keys()]
}

function getSubscriptionFromMap(workerType: WorkerType) {
  return subscriptions.get(workerType)
}

function addSubscriptionToMap(workerType: WorkerType, cleanupFunction: () => Promise<void>) {
  subscriptions.set(workerType, {
    startedAt: new Date(),
    processedEvents: 0,
    lastProcessedTimestamp: Date.now(),
    cleanupFunction,
  })
}

async function removeSubscriptionFromMap(workerType: WorkerType) {
  const subscription = subscriptions.get(workerType)
  if (subscription) {
    await subscription.cleanupFunction()
    subscriptions.delete(workerType)
  }
}

function updateSubscriptionMap(workerType: WorkerType) {
  const subscription = subscriptions.get(workerType)
  if (!subscription) {
    subscriptions.set(workerType, {
      startedAt: new Date(),
      processedEvents: 1,
      lastProcessedTimestamp: Date.now(),
      cleanupFunction: async () => {},
    })
  } else {
    subscription.processedEvents += 1
    subscription.lastProcessedTimestamp = Date.now()
  }
}

export default {
  get: getSubscriptionFromMap,
  getAll: getSubscriptionsFromMap,
  add: addSubscriptionToMap,
  remove: removeSubscriptionFromMap,
  updateStats: updateSubscriptionMap,
}
