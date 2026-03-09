import { eventClient } from '../client'
import { STATE_BUCKET_NAME } from './common'

export * from './schema'

export async function ensureStateBucket() {
  await eventClient.ensureBucket({
    name: STATE_BUCKET_NAME,
    options: {
      history: 0,
      ttlMs: 5 * 60 * 1_000, // 5 minutes
    },
  })
  return STATE_BUCKET_NAME
}

export * from './delete-state'
export * from './get-state'
export * from './write-state'
