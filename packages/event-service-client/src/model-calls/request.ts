import { eventClient } from '../client'
import { ModelProviderInstance } from '../model-provider'
import providerHealth from '../provider-health'
import { getDirectCallSubject, logger } from './common'
import {
  ChatCompletionCall,
  ChatCompletionResponse,
  EmbeddingCall,
  EmbeddingResponse,
  ModelCall,
  ModelCallSchema,
  ModelResponse,
  ModelResponseSchema,
} from './schema'

export async function directModelCall(event: EmbeddingCall, timeoutMs?: number): Promise<EmbeddingResponse>
export async function directModelCall(event: ChatCompletionCall, timeoutMs?: number): Promise<ChatCompletionResponse>
export async function directModelCall(event: ModelCall, timeoutMs?: number): Promise<ModelResponse> {
  const subject = getDirectCallSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug(`Requesting provider call response from subject`, { subject, event })
  const response = await eventClient.request({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })

  const decodedResponse = new TextDecoder().decode(response)
  const parsedResponse = ModelResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}

export const respondDirectModelCall = async <E extends ModelCall>(parameters: {
  serviceCall?: E
  handler: ({
    event,
    providerInstance,
  }: {
    event: E
    providerInstance: ModelProviderInstance
  }) => Promise<ModelResponse>
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
        const healtyService = await providerHealth.getProviderInstanceForDirectCall({
          workspaceId: event.workspaceId,
          modelProvider: event.provider,
          modelName: event.modelName,
        })
        if (!healtyService?.providerInstance) {
          logger.error('No healthy provider instance found for AI call', { event })
          throw new Error('No healthy provider instance found for AI call')
        }
        const result = await handler({ event, providerInstance: healtyService.providerInstance })
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
