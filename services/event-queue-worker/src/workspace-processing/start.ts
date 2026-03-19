import { heartbeatWorkerSlot } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from '../common'

import './common'

import { stopProcessing } from '../processing'
import { startEnrichment } from './start-enrichment'
import { startExtraction } from './start-extraction'
import { startMigration } from './start-migration'
import { startVectorization } from './start-vectorization'

export async function startWorkspaceProcessing(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Starting workspace processing', { WORKER_ID })
  let failedHeartbeatCount = 0
  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'workspaceProcessing' })
      failedHeartbeatCount = 0
    } catch (error) {
      failedHeartbeatCount++
      logger.error('Error updating worker heartbeat:', {
        WORKER_ID,
        role: 'workspaceProcessing',
        error,
        failedHeartbeatCount,
      })
      if (failedHeartbeatCount >= 3) {
        await stopProcessing('workspaceProcessing')
      }
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  try {
    const unsubscribeExtraction = await startExtraction()
    cleanupFunctions.push(async () => {
      await unsubscribeExtraction()
    })
    const unsubscribeVectorization = await startVectorization()
    cleanupFunctions.push(async () => {
      await unsubscribeVectorization()
    })
    const unsubscribeEnrichField = await startEnrichment()
    cleanupFunctions.push(async () => {
      await unsubscribeEnrichField()
    })
    const unsubscribeMigrateFiles = await startMigration()
    cleanupFunctions.push(async () => {
      await unsubscribeMigrateFiles()
    })

    logger.info('Workspace processing started successfully', { WORKER_ID, role: 'workspaceProcessing' })
    return async () => {
      await Promise.all(
        cleanupFunctions.map((fn) =>
          fn().catch((error) => logger.error('Error during cleanup in workspace processing:', { WORKER_ID, error })),
        ),
      )
    }
  } catch (error) {
    logger.error('Error starting workspace processing:', { WORKER_ID, error, role: 'workspaceProcessing' })
    try {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    } catch (cleanupError) {
      logger.error('Error during cleanup after failed startWorkspaceProcessing:', {
        WORKER_ID,
        cleanupError,
        role: 'workspaceProcessing',
      })
    }
    throw error
  }
}
