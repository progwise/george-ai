import { initializeManagementStream } from './management-stream'
import { initializeUsageStream } from './usage-stream'
import { initializeWorkerRegistryBucket } from './worker-registry'
import { initializeWorkspaceRegistryBucket } from './workspace-registry'
import { initializeWorkspaceStream } from './workspace-stream'

initializeManagementStream().catch((error) => {
  console.error('Error initializing management stream:', error)
})

initializeWorkspaceStream().catch((error) => {
  console.error('Error initializing workspace stream:', error)
})

initializeUsageStream().catch((error) => {
  console.error('Error initializing usage stream:', error)
})

initializeWorkerRegistryBucket().catch((error) => {
  console.error('Error initializing worker registry bucket:', error)
})

initializeWorkspaceRegistryBucket().catch((error) => {
  console.error('Error initializing workspace registry bucket:', error)
})

export {
  publishManagementEvent,
  subscribeManagementEvent,
  type ManagementEvent,
  ManagementEventType,
} from './management-stream'
export {
  publishWorkspaceEvent,
  subscribeWorkspaceEvent,
  getWorkspaceEventStatistics,
  getWorkspaceStatistics,
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
} from './workspace-registry'
