import { workerRegistry } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from './common'
import { startAICallProcessing } from './model-call-processing/start-ai-call-processing'
import { startProviderManager } from './model-provider-manager'
import { startWorkspaceProcessing } from './workspace-processing'

const cleanupFunctions = [] as Array<() => Promise<void>>

export async function main() {
  logger.info('starting event-queue-worker', { WORKER_ID })

  const myWorkerEntries = await workerRegistry.signup({
    workerId: WORKER_ID,
  })

  if (myWorkerEntries.length === 0) {
    logger.error('Failed to sign up new worker, no entries returned', { WORKER_ID })
    throw new Error('Failed to sign up new worker, no entries returned')
  }

  if (myWorkerEntries.some((entry) => entry.workerType === 'WORKSPACE_PROCESSING')) {
    const cleanup = await startWorkspaceProcessing()
    cleanupFunctions.push(cleanup)
  }

  if (myWorkerEntries.some((entry) => entry.workerType === 'AI_HEALTH_MANAGEMENT')) {
    const cleanup = await startProviderManager()
    cleanupFunctions.push(cleanup)
  }

  if (myWorkerEntries.some((entry) => entry.workerType === 'AI_PROVIDER_CALLING')) {
    const cleanup = await startAICallProcessing()
    cleanupFunctions.push(cleanup)
  }

  // Graceful shutdown - run cleanup on signal
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`, { WORKER_ID, myWorkerEntries })
    await Promise.all(cleanupFunctions.map((fn) => fn()))
    logger.info('Cleanup complete, exiting.', { WORKER_ID })
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  logger.info('Event-queue-worker started, waiting for events...', { WORKER_ID })
  // Function ends, but Node.js keeps running because of:
  // - setInterval (heartbeat)
  // - active subscriptions
}

main().catch((error) => {
  logger.error('Fatal error in Event Queue Worker:', { error, WORKER_ID })
  process.exit(1)
})
