import { eventClient } from '../client'
import { PROVIDER_HEALTH_BUCKET_NAME, getKey } from './common'
import { ProviderHealth } from './schema'

export async function writeProviderInstance(health: ProviderHealth): Promise<void> {
  const key = getKey({
    workspaceId: health.workspaceId,
    modelProvider: health.providerInstance.modelProvider,
    providerInstanceId: health.providerInstance.id,
  })
  const valueBytes = new TextEncoder().encode(JSON.stringify(health))
  await eventClient.putBucketEntry({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    key,
    value: valueBytes,
  })
}
