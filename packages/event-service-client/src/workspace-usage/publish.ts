import { eventClient } from '../client'
import { getEventSubject } from './common'
import { UsageTrackingEvent } from './schema'

export async function publishUsageEvent(event: UsageTrackingEvent, timeoutMs?: number) {
  const subject = getEventSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
