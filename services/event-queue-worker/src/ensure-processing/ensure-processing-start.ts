import { WorkerType } from '@george-ai/app-commons'

import { logger, subscriptions } from '../common'
import { startModelCallProcessing } from '../model-call-processing'
import { startProviderManager } from '../model-provider-manager'
import { startWorkerRegistryWatcher } from '../worker-registry-watcher'
import { startWorkspaceProcessing } from '../workspace-processing'

export async function ensureProcessingStart(workerType: WorkerType) {
  if (subscriptions.has(workerType)) {
    logger.debug('Processing for worker type already running, skipping start', { workerType })
    return
  }
  switch (workerType) {
    case 'WORKER_REGISTRY':
      subscriptions.set('WORKER_REGISTRY', {
        startedAt: new Date(),
        processedEvents: 0,
        lastProcessedTimestamp: Date.now(),
        cleanupFunction: await startWorkerRegistryWatcher(),
      })
      break
    case 'WORKSPACE_PROCESSING':
      subscriptions.set('WORKSPACE_PROCESSING', {
        startedAt: new Date(),
        processedEvents: 0,
        lastProcessedTimestamp: Date.now(),
        cleanupFunction: await startWorkspaceProcessing(),
      })
      break

    case 'AI_HEALTH_MANAGEMENT':
      subscriptions.set('AI_HEALTH_MANAGEMENT', {
        startedAt: new Date(),
        processedEvents: 0,
        lastProcessedTimestamp: Date.now(),
        cleanupFunction: await startProviderManager(),
      })
      break
    case 'AI_PROVIDER_CALLING':
      subscriptions.set('AI_PROVIDER_CALLING', {
        startedAt: new Date(),
        processedEvents: 0,
        lastProcessedTimestamp: Date.now(),
        cleanupFunction: await startModelCallProcessing(),
      })
      break

    default:
      throw new Error(`Unknown worker type: ${workerType}`)
  }
}
