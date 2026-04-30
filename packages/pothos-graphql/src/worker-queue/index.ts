// import { startAutomationQueueWorker, stopAutomationQueueWorker } from './automation-queue-worker'
// import { startEnrichmentQueueWorker, stopEnrichmentQueueWorker } from './enrichment-queue-worker'

// export async function startAllWorkers() {
//   console.log('🚀 Starting all queue workers...')

//   // Start workers in sequence to avoid race conditions
//   await startEnrichmentQueueWorker()
//   await startAutomationQueueWorker()

//   console.log('✅ All queue workers started')
// }

// export function stopAllWorkers() {
//   console.log('🛑 Stopping all queue workers...')

//   stopEnrichmentQueueWorker()
//   stopAutomationQueueWorker()

//   console.log('✅ All queue workers stopped')
// }

// // Export individual worker controls
// export { startEnrichmentQueueWorker, stopEnrichmentQueueWorker, startAutomationQueueWorker, stopAutomationQueueWorker }

// // Export worker status checkers
// export { isEnrichmentWorkerRunning } from './enrichment-queue-worker'
// export { isAutomationWorkerRunning } from './automation-queue-worker'
