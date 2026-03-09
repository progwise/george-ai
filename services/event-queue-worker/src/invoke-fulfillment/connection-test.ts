import { ConnectionTestRequest, ConnectionTestResponse } from '@george-ai/event-service-client'
import { testConnection } from '@george-ai/llm-client'

import { logger } from '../common'

export async function getConnectionTestResponse(event: ConnectionTestRequest): Promise<ConnectionTestResponse> {
  logger.debug('Getting connection test response')
  const { connection, workspaceId } = event

  const result = await testConnection(connection)

  const response: ConnectionTestResponse = {
    version: 1,
    workspaceId,
    connection,
    verb: 'response',
    action: 'connectionTest',
    timestamp: new Date(),
    success: result.success,
  }

  return response
}
