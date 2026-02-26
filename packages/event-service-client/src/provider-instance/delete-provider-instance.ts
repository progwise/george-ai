import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { PROVIDER_INSTANCE_BUCKET_NAME, getKey } from './common'

export async function deleteProviderInstance(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  providerInstanceId: string
}) {
  const { workspaceId, modelProvider, providerInstanceId } = parameters

  const key = getKey({ workspaceId, modelProvider, providerInstanceId })
  // Deleting a provider instance is essentially just deleting the provider health entry for that instance
  // since the provider health entry is what tracks the existence and health of a provider instance in the system.
  await eventClient.deleteBucketEntry({
    bucketName: PROVIDER_INSTANCE_BUCKET_NAME,
    key,
  })
}
