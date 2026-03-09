import { HealthStatusRequest, HealthStatusResponse } from '@george-ai/event-service-client'
import { statusReport } from '@george-ai/llm-client'

import { logger } from '../common'

export async function getHealthStatusResponse(event: HealthStatusRequest): Promise<HealthStatusResponse> {
  logger.debug('getting health status response', event)
  const { workspaceId, connection } = event

  const result = await statusReport(connection)

  const response: HealthStatusResponse = {
    version: 1,
    workspaceId,
    verb: 'response',
    action: 'healthStatus',
    timestamp: new Date(),
    connection,
    success: result.isConnected,
    errorCode: result.connectionErrorMessage ? '100' : undefined,
    errorMessage: result.connectionErrorMessage,
  }

  return response
}
