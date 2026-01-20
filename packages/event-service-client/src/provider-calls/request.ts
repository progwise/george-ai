import { eventClient } from '../client'
import { default as providerHealth } from '../provider-health'
import { ProviderInstance } from '../provider/schema'
import { getRequestSubject, getRespondSubjectFilter, logger } from './common'
import { AiCall, AiCallSchema, AiResponse, AiResponseSchema } from './schema'

export const directProviderCall = async (event: AiCall, timeoutMs?: number): Promise<AiResponse> => {
  const subject = getRequestSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.debug(`Requesting provider call response from subject`, { subject, event })
  const response = await eventClient.request({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })

  if (!response) {
    throw new Error('No response received for provider call')
  }

  const decodedResponse = new TextDecoder().decode(response)
  const parsedResponse = AiResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}

export const respondDirectProviderCalls = async (parameters: {
  callType: string
  handler: (event: AiCall, providerInstance: ProviderInstance) => Promise<AiResponse>
}) => {
  const { callType, handler } = parameters
  const subject = getRespondSubjectFilter({ callType })

  const cleanup = await eventClient.respond({
    subject,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = AiCallSchema.parse(JSON.parse(decoded))
        const providerInstanceHealth = await providerHealth.getProviderInstanceForDirectCall(event)
        if (!providerInstanceHealth) {
          logger.error('No suitable provider instance found for direct call', { callType, subject, event })
          throw new Error('No suitable provider instance found for direct call')
        }
        const response = await handler(event, providerInstanceHealth.providerInstance)
        const responseBytes = new TextEncoder().encode(JSON.stringify(response))
        return responseBytes
      } catch (error) {
        logger.error('Error responding direct provider call', { error, callType, subject })
        throw error
      }
    },
  })
  return cleanup
}
