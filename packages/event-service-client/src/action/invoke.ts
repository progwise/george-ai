import { eventClient } from '../client'
import { logger } from './common'
import {
  ChatRequest,
  ChatResponse,
  ConnectionTestRequest,
  ConnectionTestResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ErrorResponse,
  ErrorResponseSchema,
  HealthStatusRequest,
  HealthStatusResponse,
  ModelDiscoveryRequest,
  ModelDiscoveryResponse,
  SyncRequest,
  SyncResponse,
  SyncResponseSchema,
  WorkspaceStatsRequest,
  WorkspaceStatsResponse,
} from './schema'
import { getSyncSubject } from './subject'

export async function invokeAction(
  request: WorkspaceStatsRequest,
  timeoutMs?: number,
): Promise<WorkspaceStatsResponse | ErrorResponse>
export async function invokeAction(
  request: EmbeddingRequest,
  timeoutMs?: number,
): Promise<EmbeddingResponse | ErrorResponse>
export async function invokeAction(request: ChatRequest, timeoutMs?: number): Promise<ChatResponse | ErrorResponse>
export async function invokeAction(
  request: ConnectionTestRequest,
  timeoutMs?: number,
): Promise<ConnectionTestResponse | ErrorResponse>
export async function invokeAction(
  request: HealthStatusRequest,
  timeoutMs?: number,
): Promise<HealthStatusResponse | ErrorResponse>
export async function invokeAction(
  request: ModelDiscoveryRequest,
  timeoutMs?: number,
): Promise<ModelDiscoveryResponse | ErrorResponse>

export async function invokeAction(request: SyncRequest, timeoutMs?: number): Promise<SyncResponse | ErrorResponse> {
  const subject = getSyncSubject(request)
  const payload = new TextEncoder().encode(JSON.stringify(request))
  logger.debug(`invoke request`, { request, subject })
  const response = await eventClient.request({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })

  const decodedResponse = new TextDecoder().decode(response)

  logger.debug('Received response for provider call', { subject, decodedResponse })
  const json = JSON.parse(decodedResponse)
  const parsedResponse = SyncResponseSchema.safeParse(json)
  if (parsedResponse.success) {
    return parsedResponse.data
  } else {
    const parsedError = ErrorResponseSchema.safeParse(json)
    if (parsedError.success) {
      return parsedError.data
    } else {
      throw new Error(`Unknown response format from provider: ${decodedResponse}`)
    }
  }
}
