import { WORKER_ROLES, WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKey, getWorkerSlotKeyFilter, logger, parseWorkerSlotKey } from './common'
import { WorkerSlotEntry } from './schema'
import { MAX_WORKER_SLOTS } from './stats'

export async function signupWorker({ workerId }: { workerId: string }): Promise<WorkerRole[]> {
  const filter = getWorkerSlotKeyFilter({ workerId })
  logger.debug('Worker signup initiated', { workerId, WORKER_SLOT_BUCKET_NAME, filter })

  const existingKeys = await eventClient.getBucketKeys({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    filter,
  })

  const assignedRoles = existingKeys
    .map((key) => {
      const parsed = parseWorkerSlotKey(key)
      return parsed ? parsed.role : null
    })
    .filter((type): type is WorkerRole => type !== null)

  const unassignedRoles = WORKER_ROLES.filter((role) => !assignedRoles.includes(role))

  if (unassignedRoles.length === 0) {
    logger.warn('No more slots available during signup - keeping the previous slots', {
      workerId,
      assignedRoles,
      unassignedRoles,
    })
    return assignedRoles
  }

  const newRoles: Array<WorkerRole> = []
  for (const unassignedRole of unassignedRoles) {
    const roleFilter = getWorkerSlotKeyFilter({ role: unassignedRole })
    const key = getWorkerSlotKey({ workerId, role: unassignedRole })
    const item: WorkerSlotEntry = {
      workerId,
      role: unassignedRole,
      version: 1,
      signedUp: new Date(),
      startedActions: 0,
      successfulActions: 0,
      failedActions: 0,
    }

    let revision: number | undefined
    const watchedKeys = new Map<string, number>()

    let foundMe = () => {
      logger.warn('should not log - early addWatchedKey call')
    }

    const findMyRevision = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject('timeout'), 5000)
      foundMe = () => {
        clearTimeout(timeout)
        resolve()
      }
    })

    const unwatch = await eventClient.watchBucketKeys({
      bucketName: WORKER_SLOT_BUCKET_NAME,
      filter: roleFilter,
      handler: async ({ key: entryKey, operation, revision: entryRevision }) => {
        if (operation === 'delete') {
          watchedKeys.delete(entryKey)
        } else {
          watchedKeys.set(entryKey, entryRevision)
          if (entryRevision === revision && entryKey === key) {
            foundMe()
          }
        }
      },
    })

    try {
      const putResult = await eventClient.putBucketEntry({
        bucketName: WORKER_SLOT_BUCKET_NAME,
        key,
        item,
      })

      revision = putResult.revision

      if (watchedKeys.get(key) === revision) {
        logger.debug('watcher added revision between start watch and put', {
          key,
          unassignedRole,
          revision,
        })
        foundMe()
      }

      await findMyRevision

      const allEntries = Array.from(watchedKeys.values())
      const earlierEntries = allEntries.filter((rev) => rev < putResult.revision)
      const laterEntries = allEntries.filter((rev) => rev > putResult.revision)

      if (earlierEntries.length >= MAX_WORKER_SLOTS[unassignedRole]) {
        logger.debug('not enough free slots for worker role - removing', {
          workerId,
          unassignedRole,
          assignedRoles,
          earlierEntries,
          laterEntries,
        })
        await eventClient.deleteBucketEntry({ bucketName: WORKER_SLOT_BUCKET_NAME, key })
        continue
      }

      newRoles.push(unassignedRole)
    } catch (error) {
      logger.error('Error during assignment of unassigned role', { workerId, key, unassignedRole, error })
      await eventClient
        .deleteBucketEntry({ bucketName: WORKER_SLOT_BUCKET_NAME, key })
        .catch((errorOfError) =>
          logger.warn('Error cleaning up unassigned Role', { workerId, unassignedRole, errorOfError }),
        )
    } finally {
      unwatch()
    }
  }

  logger.debug('Worker signup completed', { workerId, assignedRoles, unassignedRoles, newRoles })

  return [...assignedRoles, ...newRoles]
}
