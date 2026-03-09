import { WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKeyFilter, logger, parseWorkerSlotKey } from './common'

const MAX_WORKERS: number = 1000

export const MAX_WORKER_SLOTS: Record<WorkerRole, number> = {
  requestFulfillment: MAX_WORKERS,
  workerSlotManager: MAX_WORKERS,
  inferenceHostManager: 2,
  workspaceProcessing: MAX_WORKERS,
  workspaceConfigManager: 2,
}

const WORKER_SLOTS: Record<WorkerRole, { max: number; current: number }> = {
  requestFulfillment: { max: MAX_WORKER_SLOTS['requestFulfillment'], current: 0 },
  workerSlotManager: { max: MAX_WORKER_SLOTS['workerSlotManager'], current: 0 },
  inferenceHostManager: { max: MAX_WORKER_SLOTS['inferenceHostManager'], current: 0 },
  workspaceProcessing: { max: MAX_WORKER_SLOTS['workspaceProcessing'], current: 0 },
  workspaceConfigManager: { max: MAX_WORKER_SLOTS['workspaceConfigManager'], current: 0 },
}

export async function workerSlotStats(): Promise<Record<WorkerRole, { max: number; current: number }>> {
  const result = { ...WORKER_SLOTS }

  const keys = await eventClient.getBucketKeys({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    filter: getWorkerSlotKeyFilter({}),
  })

  keys.forEach((key) => {
    const parsedKey = parseWorkerSlotKey(key)
    const { role } = parsedKey || {}
    if (!role) {
      logger.warn('Key in Worker Slot Bucket could not be parsed', { WORKER_SLOT_BUCKET_NAME, key })
    } else {
      result[role].current = result[role].current + 1
    }
  })

  return result
}
