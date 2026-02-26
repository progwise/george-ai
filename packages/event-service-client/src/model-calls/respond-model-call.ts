import { eventClient } from '../client'
import { ProviderInstance, getHealthyProviderInstance } from '../provider-instance'
import { getDirectCallSubject, logger } from './common'
import { ModelCall, ModelCallSchema, ModelResponse } from './schema'

export const respondModelCall = async <E extends ModelCall>(parameters: {
  serviceCall?: E
  handler: ({ event, providerInstance }: { event: E; providerInstance: ProviderInstance }) => Promise<ModelResponse>
}) => {
  const { serviceCall, handler } = parameters
  const cleanup = await eventClient.respond({
    subject: getDirectCallSubject({
      workspaceId: serviceCall?.workspaceId,
      provider: serviceCall?.provider,
      modelCallType: serviceCall?.modelCallType,
      modelName: serviceCall?.modelName,
    }),
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = ModelCallSchema.parse(JSON.parse(decoded)) as E
        const healthyInstance = await getHealthyProviderInstance({
          workspaceId: event.workspaceId,
          modelProvider: event.provider,
          modelName: event.modelName,
        })
        if (!healthyInstance) {
          logger.error('No healthy provider instance found for AI call', { event })
          const errorResponse: ModelResponse = {
            version: 1,
            modelCallType: event.modelCallType,
            resultStatus: 'error',
            errorMessage: 'No healthy provider instance found for AI call',
            processingDurationMs: 0,
          }
          return new TextEncoder().encode(JSON.stringify(errorResponse))
        }
        const result = await handler({ event, providerInstance: healthyInstance })
        return new TextEncoder().encode(JSON.stringify(result))
      } catch (error) {
        logger.error('Error handling processing event', { error, serviceCall })
        throw error
      }
    },
  })

  return async () => {
    await cleanup()
  }
}
