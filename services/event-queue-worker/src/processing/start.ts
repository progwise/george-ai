import { WorkerRole } from '@george-ai/app-schema'

import { logger } from '../common'
import { startInvokeFulfillment } from '../invoke-fulfillment'
import { startRegistryManager } from '../registry-manager'
import { startWorkerSlotManager } from '../worker-slot-manager'
import { startWorkspaceProcessing } from '../workspace-processing'
import sub from './subscription-map'

export async function startProcessing(role: WorkerRole) {
  if (sub.get(role)) {
    logger.debug('Subscription for worker role already running, skipping start', { role })
    return
  }
  switch (role) {
    case 'workerSlotManager':
      sub.add('workerSlotManager', await startWorkerSlotManager())
      break
    case 'registryManager':
      sub.add('registryManager', await startRegistryManager())
      break
    case 'workspaceProcessing':
      sub.add('workspaceProcessing', await startWorkspaceProcessing())
      break
    case 'requestFulfillment':
      sub.add('requestFulfillment', await startInvokeFulfillment())
      break
    default:
      logger.error('Attempted to start processing for unknown worker role', { role })
      throw new Error(`Unknown worker role: ${role}`)
  }
}
