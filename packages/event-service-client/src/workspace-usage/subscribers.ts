import { createLogger } from '@george-ai/web-utils'

import { eventClient } from '../client'
import { USAGE_STREAM_NAME, getConsumerGlobPattern } from './common'
import { UsageTrackingEvent, UsageTrackingEventSchema } from './schema'

const logger = createLogger('Usage Stream')

export const subscribeUsageTrackingEvent = async <E extends UsageTrackingEvent>({
  handler,
}: {
  handler: (event: E) => Promise<void>
}) => {
  await eventClient.startWorkerLoop({
    consumerGlobPattern: getConsumerGlobPattern(),
    streamName: USAGE_STREAM_NAME,
    handler: async ({ payload, error }) => {
      try {
        if (error) {
          logger.error('Error received in usage tracking event handler:', error)
          throw error
        }
        const decoded = new TextDecoder().decode(payload)
        const event = UsageTrackingEventSchema.parse(JSON.parse(decoded)) as E
        await handler(event)
      } catch (error) {
        logger.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })
}
