import { eventClient } from '../client'
import { PROVIDER_INSTANCE_BUCKET_NAME } from './common'
import { deleteProviderInstance } from './delete-provider-instance'
import { getHealthyProviderInstance } from './get-healthy-provider-instance'
import { getProviderInstances } from './get-provider-instances'
import { requestProviderInstance } from './request-provider-instance'
import { respondProviderInstance } from './respond-provider-instance'
import { watchProviderInstances } from './watch-provider-instances'
import { writeProviderInstance } from './write-provider-instance'

export * from './schema'

export async function ensureProviderInstanceBucket() {
  await eventClient.ensureBucket({
    name: PROVIDER_INSTANCE_BUCKET_NAME,
    options: {
      history: 0,
      ttlMs: 0,
    },
  })
  return PROVIDER_INSTANCE_BUCKET_NAME
}

export default {
  deleteProviderInstance,
  getHealthyProviderInstance,
  getProviderInstances,
  requestProviderInstance,
  respondProviderInstance,
  writeProviderInstance,
  watchProviderInstances,
}

export {
  deleteProviderInstance,
  getHealthyProviderInstance,
  getProviderInstances,
  requestProviderInstance,
  respondProviderInstance,
  watchProviderInstances,
  writeProviderInstance,
}
