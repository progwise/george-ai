import { ProviderInstance } from '@george-ai/event-service-client'

import { logger } from './common'
import { planMatureStatusCheck } from './provider-instances-map'

export async function handleProviderInstanceUpdated(instance: ProviderInstance) {
  logger.debug('Handle Provider Instance Updated', instance)

  planMatureStatusCheck(instance.providerInstanceId, {
    workspaceId: instance.workspaceId,
    modelProvider: instance.modelProvider,
    connection: instance.connection,
    timestamp: instance.timestamp,
    status: instance.status,
  })
}
