import { WorkerType } from '@george-ai/app-commons'

import { logger } from '../common'
import { startDocumentProcessing } from '../document-processing'
import { startModelCallResponder } from '../model-call-responder'
import { startProviderInstanceManager } from '../provider-instance-manager/start-provider-instance-manager'
import { startProviderInstanceResponder } from '../provider-instance-responder/start-provider-instance-responder'
import sub from '../subscription-map'
import { startWorkerManager } from '../worker-manager'
import { startWorkspaceManager } from '../workspace-manager'

export async function ensureProcessingStart(workerType: WorkerType) {
  if (sub.get(workerType)) {
    logger.debug('Processing for worker type already running, skipping start', { workerType })
    return
  }
  switch (workerType) {
    case 'WORKER_MANAGER':
      sub.add('WORKER_MANAGER', await startWorkerManager())
      break
    case 'WORKSPACE_MANAGER':
      sub.add('WORKSPACE_MANAGER', await startWorkspaceManager())
      break
    case 'DOCUMENT_PROCESSING':
      sub.add('DOCUMENT_PROCESSING', await startDocumentProcessing())
      break
    case 'MODEL_CALL_RESPONDER':
      sub.add('MODEL_CALL_RESPONDER', await startModelCallResponder())
      break
    case 'PROVIDER_INSTANCE_MANAGER':
      sub.add('PROVIDER_INSTANCE_MANAGER', await startProviderInstanceManager())
      break
    case 'PROVIDER_INSTANCE_RESPONDER':
      sub.add('PROVIDER_INSTANCE_RESPONDER', await startProviderInstanceResponder())
      break
    default:
      logger.error('Attempted to start processing for unknown worker type', { workerType })
      throw new Error(`Unknown worker type: ${workerType}`)
  }
}
