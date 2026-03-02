import { eventClient } from '../client'
import { PROVIDER_INSTANCE_BUCKET_NAME, getKey } from './common'
import { getProviderInstance } from './get-provider-instance'
import { ProviderInstance } from './schema'

export async function writeProviderInstance(providerInstance: ProviderInstance): Promise<void> {
  const key = getKey({
    workspaceId: providerInstance.workspaceId,
    modelProvider: providerInstance.modelProvider,
    providerInstanceId: providerInstance.providerInstanceId,
  })

  const oldValue = await getProviderInstance(providerInstance)

  const updatedValue = { ...oldValue, ...providerInstance }

  const valueBytes = new TextEncoder().encode(JSON.stringify(updatedValue))
  // TODO: Do not overwrite existing provider instance entry
  // to preserve status and timestamp information
  await eventClient.putBucketEntry({
    bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
    key,
    value: valueBytes,
  })
}
