import { eventClient } from '../client'
import { getDirectCallSubject, logger } from './common'
import { ModelCall, ModelResponse, ModelResponseSchema } from './schema'

export const directProviderCall = async (event: ModelCall, timeoutMs?: number): Promise<ModelResponse> => {
  const subject = getDirectCallSubject(event)
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
  const parsedResponse = ModelResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}
