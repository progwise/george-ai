import { eventClient } from '../client'
import { PROVIDER_HEALTH_BUCKET_NAME, getWildcardKey } from './common'
import { ProviderHealth } from './schema'

export async function watchProviderInstances(
  workspaceId: string,
  handler: (params: { operation: 'create' | 'update' | 'delete'; value: ProviderHealth | null }) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watchBucket({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    key: getWildcardKey({ workspaceId }),
    handler: async (entry) => {
      switch (entry.operation) {
        case 'update': {
          const healthEntry = entry.value ? (JSON.parse(new TextDecoder().decode(entry.value)) as ProviderHealth) : null
          return await handler({ operation: entry.operation, value: healthEntry })
        }
        case 'delete':
          await handler({ operation: 'delete', value: null })
          return
      }
    },
  })
}
