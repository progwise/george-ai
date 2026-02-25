import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { PROVIDER_HEALTH_BUCKET_NAME, getWildcardKey } from './common'
import { ProviderHealth, ProviderHealthSchema } from './schema'

export async function getProviderInstances(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
}): Promise<ProviderHealth[]> {
  const { workspaceId, modelProvider } = parameters

  const filter = getWildcardKey({ workspaceId, modelProvider })
  const keys = await eventClient.getBucketKeys({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    filter,
  })

  const healthEntries = await Promise.all(
    keys.map(async (key) => {
      const data = await eventClient.getBucketEntry({
        bucketName: PROVIDER_HEALTH_BUCKET_NAME,
        key,
      })
      if (!data) {
        return null
      }
      const decodedData = new TextDecoder().decode(data)
      return ProviderHealthSchema.parse(JSON.parse(decodedData))
    }),
  )
  return healthEntries.filter((health): health is ProviderHealth => health !== null)
}
