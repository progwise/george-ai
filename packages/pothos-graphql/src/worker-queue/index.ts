import { startAutomationQueueWorker, stopAutomationQueueWorker } from './automation-queue-worker'
import { startContentProcessingWorker, stopContentProcessingWorker } from './content-processing-worker'
import { startEnrichmentQueueWorker, stopEnrichmentQueueWorker } from './enrichment-queue-worker'

export async function startAllWorkers() {
  console.log('🚀 Starting all queue workers...')

  // Start workers in sequence to avoid race conditions
  await startEnrichmentQueueWorker()
  await startContentProcessingWorker()
  await startAutomationQueueWorker()

  console.log('✅ All queue workers started')
}

export function stopAllWorkers() {
  console.log('🛑 Stopping all queue workers...')

  stopEnrichmentQueueWorker()
  stopContentProcessingWorker()
  stopAutomationQueueWorker()

  console.log('✅ All queue workers stopped')
}

// Export individual worker controls
export {
  startEnrichmentQueueWorker,
  stopEnrichmentQueueWorker,
  startContentProcessingWorker,
  stopContentProcessingWorker,
  startAutomationQueueWorker,
  stopAutomationQueueWorker,
}
