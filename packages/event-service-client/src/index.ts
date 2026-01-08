import { createLogger } from '@george-ai/web-utils'

import { initializeManagementStream } from './management-stream'
import { initializeUsageStream } from './usage-stream'
import { initializeWorkerRegistryBucket } from './worker-registry'
import { initializeWorkspaceRegistryBucket } from './workspace-registry'
import { initializeWorkspaceStream } from './workspace-stream'

const logger = createLogger('Event Service Client')

export const initializeEventServiceClient = Promise.all([
  initializeManagementStream().catch((error) => {
    logger.error('Error initializing management stream:', error)
  }),

  initializeWorkspaceStream().catch((error) => {
    logger.error('Error initializing workspace stream:', error)
  }),

  initializeUsageStream().catch((error) => {
    logger.error('Error initializing usage stream:', error)
  }),

  initializeWorkerRegistryBucket().catch((error) => {
    logger.error('Error initializing worker registry bucket:', error)
  }),

  initializeWorkspaceRegistryBucket().catch((error) => {
    logger.error('Error initializing workspace registry bucket:', error)
  }),
])

await initializeEventServiceClient

export {
  publishManagementEvent,
  subscribeManagementEvent,
  type ManagementEvent,
  ManagementEventType,
  ManagementEventSchema,
} from './management-stream'
export {
  publishWorkspaceEvent,
  subscribeWorkspaceEvent,
  getWorkspaceEventStatistics,
  getWorkspaceStatistics,
  type WorkspaceEvent,
  WorkspaceEventType,
  WorkspaceEventSchema,
} from './workspace-stream'
export {
  getWorkerRegistryEntry,
  putWorkerRegistryEntry,
  watchWorkerRegistryEntry,
  type WorkerRegistryEntry,
  WorkerRegistrySchema,
} from './worker-registry'
export {
  getWorkspaceRegistryEntry,
  putWorkspaceRegistryEntry,
  watchWorkspaceRegistryEntry,
  type WorkspaceRegistryEntry,
  WorkspaceRegistrySchema,
} from './workspace-registry'
