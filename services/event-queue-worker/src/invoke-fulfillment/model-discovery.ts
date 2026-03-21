import { ModelDiscoveryRequest, ModelDiscoveryResponse } from '@george-ai/event-service-client'
import { availableModels } from '@george-ai/llm-client'

import { logger } from '../common'

export async function getModelDiscoveryResponse(event: ModelDiscoveryRequest): Promise<ModelDiscoveryResponse> {
  logger.debug('getting model discovery response', event)
  const { workspaceId, connection } = event

  const discoveredModels = await availableModels(connection)

  const response: ModelDiscoveryResponse = {
    version: 1,
    workspaceId,
    verb: 'response',
    action: 'modelDiscovery',
    timestamp: new Date(),
    connection,
    models: discoveredModels,
    success: true,
  }

  return response
}
