import { eventClient } from '../client'
import { USAGE_STREAM_NAME, USAGE_STREAM_SUBJECTS } from './common'

export const initializeUsageStream = async () => {
  await eventClient.ensureStream({
    streamName: USAGE_STREAM_NAME,
    description: `Events for usage reportings`,
    subjects: USAGE_STREAM_SUBJECTS,
    persist: true,
  })
  return USAGE_STREAM_NAME
}
