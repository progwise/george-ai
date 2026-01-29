import { eventClient } from '../client'
import { EventType, WORKSPACE_STREAM_NAME, getConsumerGlobPattern, getEventType, logger } from './common'
import { ActionEvent, EventSchemas, ReplyEvent, StatusEvent } from './schema'

export const subscribeEvent = async <E extends ActionEvent | StatusEvent | ReplyEvent>(parameters: {
  handler: ({ eventType, event }: { eventType: EventType; event: E }) => Promise<void>
}) => {
  const { handler } = parameters
  const unsubscribe = await eventClient.startWorkerLoop({
    streamName: WORKSPACE_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({}),
    handler: async ({ subject, payload }) => {
      logger.debug('Workspace processing received event', { subject })
      try {
        const decoded = new TextDecoder().decode(payload)
        const eventType = getEventType(subject)
        const event = EventSchemas[eventType].parse(JSON.parse(decoded)) as E
        await handler({ eventType, event })
      } catch (internalError) {
        logger.error('Error handling trigger event', { error: internalError, subject })
        throw internalError
      }
    },
  })

  return unsubscribe
}
