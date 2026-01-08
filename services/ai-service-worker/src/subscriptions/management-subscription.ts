import { ManagementEvent, ManagementEventType, subscribeManagementEvent } from '@george-ai/event-service-client'
import { createLogger } from '@george-ai/web-utils'

import { subscribeEmbeddingEvents, unsubscribeEmbeddingEvents } from './embedding-subscription'

const logger = createLogger('Management Subscription')

const managementSubscriptions = new Map<string, () => Promise<void>>()
// const extractionSubscriptions = new Map<string, () => Promise<void>>()

export const getSubscribedManagementWorkspaces = () => {
  return Array.from(managementSubscriptions.keys())
}

export const subscribeManagementEvents = async (workspaceId: string) => {
  logger.info(`Subscribing to workspace management events for workspace ${workspaceId}...`)
  const cleanup = await subscribeManagementEvent({
    workspaceId,
    eventTypes: [ManagementEventType.StartEmbedding, ManagementEventType.StopEmbedding],
    handler: handleManagementEvent,
  })
  managementSubscriptions.set(workspaceId, cleanup)
}

export const unsubscribeManagementEvents = async (workspaceId: string) => {
  logger.info(`Unsubscribing from workspace management events for workspace ${workspaceId}...`)
  const cleanup = managementSubscriptions.get(workspaceId)
  if (!cleanup) {
    logger.warn(`No management event subscription found for workspace ${workspaceId} to unsubscribe.`)
    return
  }
  await cleanup()
  managementSubscriptions.delete(workspaceId)
}

export const handleManagementEvent = async (event: ManagementEvent) => {
  logger.info(`Processing workspace management event ${event.eventType} for workspace ${event.workspaceId}...`)
  switch (event.eventType) {
    case ManagementEventType.StartEmbedding:
      logger.info(`Received StartEmbedding event for workspace ${event.workspaceId}`)
      await subscribeEmbeddingEvents(event.workspaceId)
      break
    case ManagementEventType.StopEmbedding:
      logger.info(`Received StopEmbedding event for workspace ${event.workspaceId}`)
      unsubscribeEmbeddingEvents(event.workspaceId)
      break
    default:
      logger.warn(`Unhandled workspace management event type: ${event.eventType} for workspace ${event.workspaceId}`)
      break
  }
}
