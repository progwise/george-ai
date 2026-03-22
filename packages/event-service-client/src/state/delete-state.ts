import { eventClient } from '../client'
import { logger } from '../common'
import { STATE_BUCKET_NAME } from './common'
import { StateItemFilter } from './filter'
import { getStateKeyFilter } from './subject'

export async function deleteState(filter: StateItemFilter) {
  const f = getStateKeyFilter(filter)
  logger.info('Delete state items', { filter: f })

  await eventClient.deleteBucketEntries({
    bucketName: STATE_BUCKET_NAME,
    filter: f,
  })
}
