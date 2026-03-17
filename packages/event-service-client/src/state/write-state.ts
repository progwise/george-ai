import { eventClient } from '../client'
import { STATE_BUCKET_NAME, logger } from './common'
import { StateItem } from './schema'
import { getStateKey } from './subject'

export async function writeState(item: StateItem): Promise<{ revision: number; item: StateItem; key: string }> {
  const key = getStateKey(item)
  logger.debug('Write state', { item, key })
  const result = await eventClient.putBucketEntry({
    bucketName: STATE_BUCKET_NAME,
    key,
    item,
  })

  return { ...result, item, key }
}
