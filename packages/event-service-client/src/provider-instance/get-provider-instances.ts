import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { PROVIDER_INSTANCE_BUCKET_NAME, getWildcardKey } from './common'
import { ProviderInstance, ProviderInstanceSchema } from './schema'

export async function getProviderInstances(parameters: {
  workspaceId: string
  modelProvider?: ModelProvider
}): Promise<ProviderInstance[]> {
  const { workspaceId, modelProvider } = parameters

  const filter = getWildcardKey({ workspaceId, modelProvider })
  const keys = await eventClient.getBucketKeys({
    bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
    filter,
  })

  const instanceEntries = await Promise.all(
    keys.map(async (key) => {
      const data = await eventClient.getBucketEntry({
        bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
        key,
      })
      if (!data) {
        return null
      }
      const decodedData = new TextDecoder().decode(data)
      return ProviderInstanceSchema.parse(JSON.parse(decodedData))
    }),
  )
  return instanceEntries.filter((instance): instance is ProviderInstance => instance !== null)
}
