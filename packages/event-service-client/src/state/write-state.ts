import { eventClient } from '../client'
import { STATE_BUCKET_NAME, logger } from './common'
import { StateItem } from './schema'
import { getStateKey } from './subject'

export async function writeState(item: StateItem): Promise<{ revision: number }> {
  logger.debug('Write state', item)

  const key = getStateKey(item)
  const result = await eventClient.putBucketEntry({
    bucketName: STATE_BUCKET_NAME,
    key,
    item,
  })

  return result
}
