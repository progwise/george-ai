import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME } from './common'
import { deleteWorkspaceConfig } from './delete-workspace-config'
import { getWorkspaceConfig } from './get-workspace-config'
import { type WorkspaceConfig, WorkspaceConfigSchema } from './schema'
import { watchWorkspaceConfigs } from './watch-workspace-config'
import { writeWorkspaceConfig } from './write-workspace-config'

export { type WorkspaceConfig }

export async function ensureWorkspaceConfigBucket() {
  await eventClient.ensureBucket({
    name: WORKSPACE_CONFIG_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: undefined,
    },
  })
  return WORKSPACE_CONFIG_BUCKET_NAME
}

export default {
  deleteWorkspaceConfig,
  getWorkspaceConfig,
  writeWorkspaceConfig,
  watchWorkspaceConfigs,
  WorkspaceConfigSchema,
}

export { deleteWorkspaceConfig, getWorkspaceConfig, writeWorkspaceConfig, watchWorkspaceConfigs, WorkspaceConfigSchema }
