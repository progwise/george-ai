import { initializeManagementStream } from './management-stream'
import { initializeUsageStream } from './usage-stream'
import { initializeWorkerRegistryBucket } from './worker-registry'
import { initializeWorkspaceRegistryBucket } from './workspace-registry'
import { initializeWorkspaceStream } from './workspace-stream'

export const initializeEventServiceClient = Promise.all([
  initializeManagementStream().catch((error) => {
    console.error('Error initializing management stream:', error)
  }),

  initializeWorkspaceStream().catch((error) => {
    console.error('Error initializing workspace stream:', error)
  }),

  initializeUsageStream().catch((error) => {
    console.error('Error initializing usage stream:', error)
  }),

  initializeWorkerRegistryBucket().catch((error) => {
    console.error('Error initializing worker registry bucket:', error)
  }),

  initializeWorkspaceRegistryBucket().catch((error) => {
    console.error('Error initializing workspace registry bucket:', error)
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
