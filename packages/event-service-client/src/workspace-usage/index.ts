import { eventClient } from '../client'
import { USAGE_STREAM_NAME, USAGE_STREAM_SUBJECTS } from './common'
import { ensureUsageConsumer } from './consumers'
import { publishUsageEvent } from './publish'
import { subscribeUsageTrackingEvent } from './subscribers'

let initialized = false

export const initializeWorkspaceUsageStream = async () => {
  await eventClient.ensureStream({
    streamName: USAGE_STREAM_NAME,
    description: `Events for usage reportings`,
    subjects: USAGE_STREAM_SUBJECTS,
    persist: false,
  })
  initialized = true
  return USAGE_STREAM_NAME
}

export type { UsageTrackingEvent } from './schema'

export default { initialized, publishUsageEvent, subscribeUsageTrackingEvent, ensureUsageConsumer }
