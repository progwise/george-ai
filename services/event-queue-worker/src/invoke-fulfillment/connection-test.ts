import { ConnectionTestRequest, ConnectionTestResponse, ErrorResponse } from '@george-ai/event-service-client'
import { testConnection } from '@george-ai/llm-client'

import { logger } from '../common'

export async function getConnectionTestResponse(
  event: ConnectionTestRequest,
): Promise<ConnectionTestResponse | ErrorResponse> {
  logger.debug('Getting connection test response')
  const { connection, workspaceId } = event

  const result = await testConnection(connection)

  if (!result.success) {
    logger.error('Connection test failed', { connection, result })
    const response: ErrorResponse = {
      version: 1,
      workspaceId,
      verb: 'response',
      action: 'connectionTest',
      timestamp: new Date(),
      success: false,
      error: 'No success reported',
    }
    return response
  }

  const response: ConnectionTestResponse = {
    version: 1,
    workspaceId,
    connection,
    verb: 'response',
    action: 'connectionTest',
    timestamp: new Date(),
    success: true,
  }

  return response
}
