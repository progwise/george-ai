import { eventClient } from '../client'
import { MANAGEMENT_STREAM_NAME, MANAGEMENT_STREAM_SUBJECTS } from './common'

export { publishManagementEvent } from './publish'
export { subscribeManagementEvent } from './subscribe'
export { type ManagementEvent, ManagementEventType, ManagementEventSchema } from './schema'

export const initializeManagementStream = async () => {
  await eventClient.ensureStream({
    streamName: MANAGEMENT_STREAM_NAME,
    description: `Events for management operations`,
    subjects: MANAGEMENT_STREAM_SUBJECTS,
    persist: true,
  })
  return MANAGEMENT_STREAM_NAME
}
