import { ProviderTestConnectionRequest, ProviderTestConnectionResponse } from '@george-ai/event-service-client'
import { testConnection } from '@george-ai/llm-client'

import { logger } from './common'

export async function testProviderInstanceConnection(
  event: ProviderTestConnectionRequest,
): Promise<ProviderTestConnectionResponse> {
  const start = Date.now()

  const result = await testConnection({
    modelProvider: event.modelProvider,
    connection: event.connection,
  })

  logger.info('remove before flight', {
    event,
    result,
  })

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
