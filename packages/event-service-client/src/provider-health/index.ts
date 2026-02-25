import { eventClient } from '../client'
import { PROVIDER_HEALTH_BUCKET_NAME } from './common'
import { getProviderInstance } from './get-provider-instance'
import { getProviderInstances } from './get-provider-instances'
import { watchProviderInstances } from './watch-provider-instances'
import { writeProviderInstance } from './write-provider-instance'

export { type ProviderHealth } from './schema'

export async function ensureProviderHealthBucket() {
  await eventClient.ensureBucket({
    name: PROVIDER_HEALTH_BUCKET_NAME,
    options: {
      history: 0,
      ttlMs: 60 * 1000,
    },
  })
  return PROVIDER_HEALTH_BUCKET_NAME
}

export default {
  getProviderInstance,
  getProviderInstances,
  writeProviderInstance,
  watchProviderInstances,
}

export { getProviderInstance, getProviderInstances, watchProviderInstances, writeProviderInstance }
