import { ManagementEvent, ManagementEventType, subscribeManagementEvent } from '@george-ai/event-service-client'

import { subscribeEmbeddingEvents, unsubscribeEmbeddingEvents } from './embedding-subscription'

const managementSubscriptions = new Map<string, () => Promise<void>>()
// const extractionSubscriptions = new Map<string, () => Promise<void>>()

export const getSubscribedManagementWorkspaces = () => {
  return Array.from(managementSubscriptions.keys())
}

export const subscribeManagementEvents = async (workspaceId: string) => {
  console.log(`Subscribing to workspace management events for workspace ${workspaceId}...`)
  const cleanup = await subscribeManagementEvent({
    workspaceId,
    eventTypes: [ManagementEventType.StartEmbedding, ManagementEventType.StopEmbedding],
    handler: handleManagementEvent,
  })
  managementSubscriptions.set(workspaceId, cleanup)
}

export const unsubscribeManagementEvents = async (workspaceId: string) => {
  console.log(`Unsubscribing from workspace management events for workspace ${workspaceId}...`)
  const cleanup = managementSubscriptions.get(workspaceId)
  if (!cleanup) {
    console.warn(`No management event subscription found for workspace ${workspaceId} to unsubscribe.`)
    return
  }
  await cleanup()
  managementSubscriptions.delete(workspaceId)
}

export const handleManagementEvent = async (event: ManagementEvent) => {
  console.log(`Processing workspace management event ${event.eventType} for workspace ${event.workspaceId}...`)
  switch (event.eventType) {
    case ManagementEventType.StartEmbedding:
      console.log(`Received StartEmbedding event for workspace ${event.workspaceId}`)
      await subscribeEmbeddingEvents(event.workspaceId)
      break
    case ManagementEventType.StopEmbedding:
      console.log(`Received StopEmbedding event for workspace ${event.workspaceId}`)
      unsubscribeEmbeddingEvents(event.workspaceId)
      break
    default:
      console.warn(`Unhandled workspace management event type: ${event.eventType} for workspace ${event.workspaceId}`)
      break
  }
}
