import { eventClient } from '../shared'

const ADMIN_STREAM_NAME = 'admin'
const ADMIN_STREAM_SUBJECT = 'admin.*'

let adminStreamInitialized = false

export const ensureAdminStream = async () => {
  if (adminStreamInitialized) return ADMIN_STREAM_NAME

  await eventClient.ensureStream({
    streamName: ADMIN_STREAM_NAME,
    description: 'System-wide admin events',
    subjects: [ADMIN_STREAM_SUBJECT],
    persist: true,
  })

  adminStreamInitialized = true
  return ADMIN_STREAM_NAME
}

export const getAdminStreamName = () => ADMIN_STREAM_NAME
