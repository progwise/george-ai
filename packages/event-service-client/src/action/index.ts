import { eventClient } from '../client'
import { ACTION_STREAM_NAME } from './common'
import { getStreamSubjects } from './subject'

export * from './invoke'
export * from './publish'
export * from './schema'
export * from './fulfill'
export * from './view'
export * from './subscribe'

export async function ensureActionStream() {
  const subjects = getStreamSubjects()
  await eventClient.ensureWorkerStream({
    streamName: ACTION_STREAM_NAME,
    subjects,
  })
  return ACTION_STREAM_NAME
}
