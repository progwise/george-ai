import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { PROVIDER_INSTANCE_BUCKET_NAME, getKey } from './common'
import { ProviderInstance, ProviderInstanceSchema } from './schema'

export async function getProviderInstance(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  providerInstanceId: string
}): Promise<ProviderInstance | null> {
  const { workspaceId, modelProvider, providerInstanceId } = parameters

  const key = getKey({ workspaceId, modelProvider, providerInstanceId })

  const data = await eventClient.getBucketEntry({
    bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
    key,
  })
  if (!data) {
    return null
  }
  const decodedData = new TextDecoder().decode(data)
  return ProviderInstanceSchema.parse(JSON.parse(decodedData))
}
