import { ProviderTestConnectionRequest, ProviderTestConnectionResponse } from '@george-ai/event-service-client'
import { testConnection } from '@george-ai/llm-client'

export async function testProviderInstanceConnection(
  event: ProviderTestConnectionRequest,
): Promise<ProviderTestConnectionResponse> {
  const start = Date.now()

  const result = await testConnection(event.connection)

  const durationMs = start - Date.now()

  const response: ProviderTestConnectionResponse = {
    processingDurationMs: durationMs,
    requestType: event.requestType,
    resultStatus: result.success ? 'success' : 'error',
    version: 1,
    success: result.success,
    errorMessage: result.errorMessage,
  }

  return response
}
