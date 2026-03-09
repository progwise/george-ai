import { WorkerRole } from '@george-ai/app-schema'

const subscriptions = new Map<
  WorkerRole,
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

function getSubscriptionFromMap(workerRole: WorkerRole) {
  return subscriptions.get(workerRole)
}

function addSubscriptionToMap(workerRole: WorkerRole, cleanupFunction: () => Promise<void>) {
  subscriptions.set(workerRole, {
    startedAt: new Date(),
    processedEvents: 0,
    lastProcessedTimestamp: Date.now(),
    cleanupFunction,
  })
}

async function removeSubscriptionFromMap(workerRole: WorkerRole) {
  const subscription = subscriptions.get(workerRole)
  if (subscription) {
    await subscription.cleanupFunction()
    subscriptions.delete(workerRole)
  }
}

function updateSubscriptionMap(workerRole: WorkerRole) {
  const subscription = subscriptions.get(workerRole)
  if (!subscription) {
    subscriptions.set(workerRole, {
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
