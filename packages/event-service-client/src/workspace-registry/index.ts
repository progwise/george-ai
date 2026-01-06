import { eventClient } from '../client'
import { WORKSPACE_REGISTRY_BUCKET_NAME } from './common'
import { WorkspaceRegistryEntry, WorkspaceRegistrySchema } from './schema'

export { type WorkspaceRegistryEntry, WorkspaceRegistrySchema } from './schema'

export async function initializeWorkspaceRegistryBucket() {
  await eventClient.ensureBucket({
    name: WORKSPACE_REGISTRY_BUCKET_NAME,
    options: {
      history: 3,
      ttlMs: undefined,
    },
  })
  return WORKSPACE_REGISTRY_BUCKET_NAME
}

export async function getWorkspaceRegistryEntry(workspaceId: string): Promise<WorkspaceRegistryEntry | null> {
  const data = await eventClient.get({
    bucketName: WORKSPACE_REGISTRY_BUCKET_NAME,
    key: `workspace.${workspaceId}.entry`,
  })
  if (!data) {
    return null
  }
  const decodedData = new TextDecoder().decode(data)
  return WorkspaceRegistrySchema.parse(JSON.parse(decodedData))
}

export async function putWorkspaceRegistryEntry(entry: WorkspaceRegistryEntry): Promise<void> {
  const valueBytes = new TextEncoder().encode(JSON.stringify(entry))
  await eventClient.put({
    bucketName: WORKSPACE_REGISTRY_BUCKET_NAME,
    key: `workspace.${entry.workspaceId}.entry`,
    value: valueBytes,
  })
}

export async function watchWorkspaceRegistryEntry(
  handler: (params: {
    workspaceId: string
    operation: 'create' | 'update' | 'delete'
    value: WorkspaceRegistryEntry | null
  }) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watch({
    bucketName: WORKSPACE_REGISTRY_BUCKET_NAME,
    key: `workspace.*.entry`,
    handler: async (entry) => {
      let workspaceId = ''
      const workspaceIdMatch = entry.key.match(/workspace\.(.+?)\.entry/)
      if (workspaceIdMatch) {
        workspaceId = workspaceIdMatch[1]
      }

      switch (entry.operation) {
        case 'create':
        case 'update': {
          const workspaceEntry = entry.value
            ? WorkspaceRegistrySchema.parse(JSON.parse(new TextDecoder().decode(entry.value)))
            : null
          return await handler({ workspaceId, operation: entry.operation, value: workspaceEntry })
        }
        case 'delete':
          await handler({ workspaceId, operation: 'delete', value: null })
          return
      }
    },
  })
}
