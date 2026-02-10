import { eventClient } from '../client'
import { ModelProviderInstance } from '../model-provider/schema'
import providerHealth from '../provider-health'
import { MODEL_CALLS_STREAM_NAME, getConsumerGlobPattern, logger } from './common'
import { ModelCall, ModelCallSchema } from './schema'

export const subscribeModelCalls = async <E extends ModelCall>(parameters: {
  serviceCall?: ModelCall
  handler: ({ event, providerInstance }: { event: E; providerInstance: ModelProviderInstance }) => Promise<void>
}) => {
  const { serviceCall, handler } = parameters
  const subscribedConsumerCleanups = new Map<string, () => Promise<void>>()
  const cleanup = await eventClient.startWorkerLoop({
    streamName: MODEL_CALLS_STREAM_NAME,
    consumerGlobPattern: getConsumerGlobPattern({}),
    handler: async ({ payload }) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = ModelCallSchema.parse(JSON.parse(decoded)) as E
        const healtyService = await providerHealth.getProviderInstanceForDirectCall({
          workspaceId: event.workspaceId,
          modelProvider: event.provider,
          modelName: event.modelName,
        })
        if (!healtyService?.providerInstance) {
          logger.error('No healthy provider instance found for AI call', { event })
          throw new Error('No healthy provider instance found for AI call')
        }
        await handler({ event, providerInstance: healtyService.providerInstance })
      } catch (error) {
        logger.error('Error handling processing event', { error, serviceCall })
        throw error
      }
    },
  })

  return async () => {
    await Promise.all(Array.from(subscribedConsumerCleanups.values()).map((cleanup) => cleanup()))
    subscribedConsumerCleanups.clear()
    await cleanup()
  }
}
