import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { logger, parseKey } from './common'
import { PROVIDER_INSTANCE_BUCKET_NAME, getWildcardKey } from './common'
import { ProviderInstance, ProviderInstanceSchema } from './schema'

export async function watchProviderInstances(
  handler: (params: {
    workspaceId: string
    modelProvider: ModelProvider
    providerInstanceId: string
    operation: 'update' | 'delete'
    value: ProviderInstance | null
  }) => Promise<void>,
  workspaceId?: string,
): Promise<() => Promise<void>> {
  return await eventClient.watchBucket({
    bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
    key: getWildcardKey({ workspaceId }),
    handler: async (entry) => {
      const { workspaceId, providerInstanceId, modelProvider } = parseKey(entry.key)

      switch (entry.operation) {
        case 'update': {
          if (!entry.value || entry.value.length === 0) {
            logger.warn('Received update operation for provider instance with null value, skipping', {
              entry,
            })
            return
          }
          const rawValue = new TextDecoder().decode(entry.value)
          const parsedJson = JSON.parse(rawValue)
          const providerInstance = ProviderInstanceSchema.parse(parsedJson)
          return await handler({
            workspaceId,
            providerInstanceId,
            modelProvider,
            operation: entry.operation,
            value: providerInstance,
          })
        }
        case 'delete':
          await handler({ operation: 'delete', workspaceId, providerInstanceId, modelProvider, value: null })
          return
      }
    },
  })
}
