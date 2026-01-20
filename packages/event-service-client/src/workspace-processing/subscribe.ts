import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerGlobPattern, logger } from './common'
import { ProcessEvent, ProcessSchema, type ProcessType } from './schema'

export const subscribeProcessEvent = async <E extends ProcessEvent>(parameters: {
  processType: ProcessType
  handler: ({ event, error }: { event: E; error: unknown }) => Promise<void>
}) => {
  const { processType, handler } = parameters
  const unsubscribe = await eventClient.startWorkerLoop({
    streamName: WORKSPACE_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({ processType }),
    handler: async ({ payload, error }) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = ProcessSchema.parse(JSON.parse(decoded)) as E
        await handler({ event, error })
      } catch (internalError) {
        logger.error('Error handling processing event', { error: internalError, processType })
        throw internalError
      }
    },
  })

  return unsubscribe
}
