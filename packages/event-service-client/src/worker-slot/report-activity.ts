import pRetry, { AbortError } from 'p-retry'

import { getErrorMeta } from '@george-ai/app-commons'
import { WorkerActionResult, WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKey, logger } from './common'
import { getWorkerSlotEntry } from './get'
import { WorkerSlotEntry, WorkerSlotEntrySchema } from './schema'

export async function reportWorkerActivity(params: {
  workerId: string
  role: WorkerRole
  activityType: WorkerActionResult
}): Promise<WorkerSlotEntry> {
  const { workerId, role, activityType } = params
  logger.debug('reportWorkerActivity:start', params)

  const run = async () => {
    const key = getWorkerSlotKey({ workerId, role })
    const existingEntryData = await getWorkerSlotEntry({ workerId, role })

    if (!existingEntryData) {
      logger.error('No existing worker slot entry found for worker activity report', { workerId, role })
      throw new Error(`Worker slot entry not found for workerId: ${workerId}, role: ${role}`)
    }

    logger.debug('reportWorkerActivity:existing', params)

    const { revision, entry: existingEntry } = existingEntryData

    try {
      const updatedEntry = WorkerSlotEntrySchema.parse({
        ...existingEntry,
        latestActivity: new Date(),
        latestActivityType: activityType,
        latestActionStart: activityType === 'start' ? new Date() : existingEntry.latestActionStart,
        latestActionEnd: activityType === 'success' ? new Date() : existingEntry.latestActionEnd,
        latestActionFailure: activityType === 'failure' ? new Date() : existingEntry.latestActionFailure,
        startedActions: activityType === 'start' ? existingEntry.startedActions + 1 : existingEntry.startedActions,
        successfulActions:
          activityType === 'success' ? existingEntry.successfulActions + 1 : existingEntry.successfulActions,
        failedActions: activityType === 'failure' ? existingEntry.failedActions + 1 : existingEntry.failedActions,
      })
      await eventClient.putBucketEntry({
        bucketName: WORKER_SLOT_BUCKET_NAME,
        key,
        item: updatedEntry,
        revision,
      })
      logger.debug('reportWorkerActivity:updated', { workerId, role, activityType })

      return updatedEntry
    } catch (error) {
      const { errorMessage, errorCode } = getErrorMeta(error)

      const isConflict = errorMessage.includes('wrong last sequence') || errorCode === '10071'
      logger.error('Failed to report worker activity', { workerId, role, activityType, error })
      if (!isConflict) {
        throw new AbortError(errorMessage)
      }
      throw error
    }
  }

  return await pRetry(run, {
    onFailedAttempt: (error) => {
      logger.warn('reportWorkerActivity attempt failed, retrying...', {
        workerId,
        role,
        activityType,
        attemptNumber: error.attemptNumber,
        retriesLeft: error.retriesLeft,
        error: error,
      })
    },
    retries: 5,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  })
}
