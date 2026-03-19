import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME } from './common'
import { deleteRegistryEntry } from './delete-entry'
import { getRegistryEntries } from './get-entries'
import { getRegistryEntry } from './get-entry'
import { watchRegistry } from './watch'
import { writeRegistryEntry } from './write-entry'

export * from './schema'

export async function ensureRegistryBucket() {
  await eventClient.ensureBucket({
    name: REGISTRY_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: 0,
    },
  })
  return REGISTRY_BUCKET_NAME
}

export { getRegistryEntries, getRegistryEntry, watchRegistry, writeRegistryEntry, deleteRegistryEntry }
