import { eventClient } from '../client'
import { logger } from './common'
import {
  ChatRequest,
  ChatResponse,
  ConnectionTestRequest,
  ConnectionTestResponse,
  EmbeddingRequest,
  EmbeddingResponse,
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

export async function invokeAction(request: WorkspaceStatsRequest, timeoutMs?: number): Promise<WorkspaceStatsResponse>
export async function invokeAction(request: EmbeddingRequest, timeoutMs?: number): Promise<EmbeddingResponse>
export async function invokeAction(request: ChatRequest, timeoutMs?: number): Promise<ChatResponse>
export async function invokeAction(request: ConnectionTestRequest, timeoutMs?: number): Promise<ConnectionTestResponse>
export async function invokeAction(request: HealthStatusRequest, timeoutMs?: number): Promise<HealthStatusResponse>
export async function invokeAction(request: ModelDiscoveryRequest, timeoutMs?: number): Promise<ModelDiscoveryResponse>

export async function invokeAction(request: SyncRequest, timeoutMs?: number): Promise<SyncResponse> {
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
  const parsedResponse = SyncResponseSchema.parse(json)
  return parsedResponse
}
