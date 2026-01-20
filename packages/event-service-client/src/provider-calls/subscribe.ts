import { eventClient } from '../client'
import { default as providerHealth } from '../provider-health'
import { ProviderInstance } from '../provider/schema'
import { AI_SERVICE_CALLS_STREAM_NAME, getConsumerName, logger } from './common'
import { AiCall, AiCallSchema, AiServiceCall } from './schema'

export const subscribeAiCalls = async (parameters: {
  workspaceId: string
  serviceCall: AiServiceCall
  handler: (event: AiCall, providerInstance: ProviderInstance) => Promise<void>
}) => {
  const { workspaceId, serviceCall, handler } = parameters
  const subscribedConsumerCleanups = new Map<string, () => Promise<void>>()

  const cleanup = await providerHealth.watchProviderHealth(workspaceId, async ({ operation, value }) => {
    if (!value) {
      logger.warn('No provider instance info available for service call subscription', {
        serviceCall,
        workspaceId,
        operation,
      })
      return
    }
    const { providerInstance } = value
    if (operation === 'delete') {
      const consumerName = getConsumerName({
        workspaceId,
        provider: providerInstance.provider,
        providerInstanceId: providerInstance.id,
      })
      const existingCleanup = subscribedConsumerCleanups.get(consumerName)
      if (existingCleanup) {
        await existingCleanup()
        subscribedConsumerCleanups.delete(consumerName)
      }
      return
    }
    const consumerName = getConsumerName({
      workspaceId,
      provider: providerInstance.provider,
      providerInstanceId: providerInstance.id,
    })
    if (subscribedConsumerCleanups.has(consumerName)) {
      // Already subscribed
      return
    }
    const cleanup = await eventClient.subscribe({
      streamName: AI_SERVICE_CALLS_STREAM_NAME,
      consumerName,
      handler: async (payload) => {
        try {
          const decoded = new TextDecoder().decode(payload)
          const event = AiCallSchema.parse(JSON.parse(decoded))
          await handler(event, value.providerInstance)
        } catch (error) {
          logger.error('Error handling processing event', { error, serviceCall, workspaceId })
          throw error
        }
      },
    })
    subscribedConsumerCleanups.set(consumerName, cleanup)
  })

  return async () => {
    await Promise.all(Array.from(subscribedConsumerCleanups.values()).map((cleanup) => cleanup()))
    subscribedConsumerCleanups.clear()
    await cleanup()
  }
}
