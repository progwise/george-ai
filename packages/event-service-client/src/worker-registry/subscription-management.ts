import { getWorkerRegistryEntry, putWorkerRegistryEntry } from './entry'
import { ProcessingType } from './schema'

export async function addWorkspaceToWorkerEntry(
  workerId: string,
  workspaceId: string,
  processingType: ProcessingType,
): Promise<void> {
  const entry = await getWorkerRegistryEntry(workerId)
  if (!entry) {
    throw new Error(`Worker registry entry not found for workerId: ${workerId}`)
  }

  const existingSubscriptionIndex = entry.activeSubscriptions.findIndex((sub) => sub.workspaceId === workspaceId)

  const newSubscription = {
    workspaceId,
    processingType,
    subscribedAt: new Date().toISOString(),
  }

  if (existingSubscriptionIndex >= 0) {
    // Update existing subscription
    entry.activeSubscriptions[existingSubscriptionIndex] = newSubscription
  } else {
    // Add new subscription
    entry.activeSubscriptions.push(newSubscription)
  }

  entry.lastHeartbeat = new Date().toISOString()

  await putWorkerRegistryEntry(entry)
}

export async function removeWorkspaceFromWorkerEntry(
  workerId: string,
  workspaceId: string,
  processingType?: ProcessingType,
): Promise<void> {
  const entry = await getWorkerRegistryEntry(workerId)
  if (!entry) {
    throw new Error(`Worker registry entry not found for workerId: ${workerId}`)
  }

  entry.activeSubscriptions = processingType
    ? entry.activeSubscriptions.filter(
        (sub) => sub.workspaceId !== workspaceId || sub.processingType !== processingType,
      )
    : entry.activeSubscriptions.filter((sub) => sub.workspaceId !== workspaceId)
  entry.lastHeartbeat = new Date().toISOString()

  await putWorkerRegistryEntry(entry)
}
