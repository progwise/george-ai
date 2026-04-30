import pRetry, { AbortError } from 'p-retry'

import { getErrorMeta } from '@george-ai/app-commons'
import { WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKey, logger } from './common'
import { getWorkerSlotEntry } from './get'
import { WorkerSlotEntrySchema } from './schema'

export async function heartbeatWorkerSlot(parameters: { workerId: string; role: WorkerRole }): Promise<void> {
  const { workerId, role } = parameters
  logger.debug('Received heartbeat for worker slot', { workerId, role })
  const run = async () => {
    const entryData = await getWorkerSlotEntry({ workerId, role })
    if (!entryData) {
      logger.error('Worker slot entry not found for heartbeat', { workerId, role })
      throw new Error(`Worker slot entry not found for workerId: ${workerId}, role: ${role}`)
    }

    const { revision, entry } = entryData

    const key = getWorkerSlotKey({ workerId, role })

    logger.debug('Updating worker heartbeat', { workerId, role, key })

    try {
      const updatedEntry = WorkerSlotEntrySchema.parse({
        ...entry,
        lastHeartbeat: new Date(),
      })
      await eventClient.putBucketEntry({
        bucketName: WORKER_SLOT_BUCKET_NAME,
        key: key,
        item: updatedEntry,
        revision,
      })
    } catch (error) {
      const { errorMessage, errorCode } = getErrorMeta(error)

      const isConflict = errorMessage.includes('wrong last sequence') || errorCode === '10071'
      if (!isConflict) {
        throw new AbortError(errorMessage)
      }
      throw error
    }
  }

  return await pRetry(run, {
    onFailedAttempt: (error) => {
      logger.warn('Failed to update worker heartbeat, will retry', {
        workerId,
        role,
        attemptNumber: error.attemptNumber,
        retriesLeft: error.retriesLeft,
        error: error,
      })
    },
    retries: 2,
  })
}
