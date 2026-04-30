import { eventClient } from '../client'
import { logger } from '../common'
import { STATE_BUCKET_NAME } from './common'
import { InferenceHostFilter, InferenceModelFilter, StateItemFilter } from './filter'
import { InferenceHostState, InferenceModelState, StateItem, StateItemSchema } from './schema'
import { getStateKeyFilter } from './subject'

export async function getState(filter: InferenceHostFilter): Promise<InferenceHostState[]>
export async function getState(filter: InferenceModelFilter): Promise<InferenceModelState[]>
export async function getState(filter: StateItemFilter): Promise<StateItem[]> {
  logger.debug('Getting state items', filter)

  const entries = await eventClient.getBucketEntries({
    bucketName: STATE_BUCKET_NAME,
    filter: getStateKeyFilter(filter),
    schema: StateItemSchema,
  })

  return entries.map((entry) => entry.value)
}
