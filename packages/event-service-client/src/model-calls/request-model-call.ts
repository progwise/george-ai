import { eventClient } from '../client'
import { getDirectCallSubject, logger } from './common'
import {
  ChatCompletionCall,
  ChatCompletionResponse,
  EmbeddingCall,
  EmbeddingResponse,
  ModelResponse,
  ModelResponseSchema,
} from './schema'

export async function requestModelCall(event: EmbeddingCall, timeoutMs?: number): Promise<EmbeddingResponse>
export async function requestModelCall(event: ChatCompletionCall, timeoutMs?: number): Promise<ChatCompletionResponse>
export async function requestModelCall(
  event: EmbeddingCall | ChatCompletionCall,
  timeoutMs?: number,
): Promise<ModelResponse> {
  const subject = getDirectCallSubject(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  logger.info(`Requesting provider call response from subject`, { subject, event })
  const response = await eventClient.request({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })

  const decodedResponse = new TextDecoder().decode(response)
  logger.info('Received response for provider call', { subject, decodedResponse })
  const parsedResponse = ModelResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}
