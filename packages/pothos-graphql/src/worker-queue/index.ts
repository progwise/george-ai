import { startContentExtractionWorker, stopContentExtractionWorker } from './content-extraction-worker'
import { startEnrichmentQueueWorker, stopEnrichmentQueueWorker } from './enrichment-queue-worker'

export async function startAllWorkers() {
  console.log('🚀 Starting all queue workers...')

  // Start workers in sequence to avoid race conditions
  await startEnrichmentQueueWorker()
  await startContentExtractionWorker()

  console.log('✅ All queue workers started')
}

export function stopAllWorkers() {
  console.log('🛑 Stopping all queue workers...')

  stopEnrichmentQueueWorker()
  stopContentExtractionWorker()

  console.log('✅ All queue workers stopped')
}

// Export individual worker controls
export {
  startEnrichmentQueueWorker,
  stopEnrichmentQueueWorker,
  startContentExtractionWorker,
  stopContentExtractionWorker,
}
