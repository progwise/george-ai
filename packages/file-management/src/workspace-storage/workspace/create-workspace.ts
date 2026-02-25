import { logger } from '../commons'
import { createEntry, entryExists } from '../entry'
import { StorageStatsSchema, WorkspaceManifest } from '../schema'

export async function createWorkspace(
  workspaceId: string,
  args: { name: string; creator?: string },
): Promise<WorkspaceManifest> {
  const { name, creator } = args
  const workspaceExists = await entryExists({
    type: 'workspace',
    workspaceId,
    version: 1,
  })
  if (workspaceExists) {
    logger.error('Workspace with given id already exists, cannot create workspace', { workspaceId })
    throw new Error(`Workspace with id ${workspaceId} already exists.`)
  }

  const workspaceManifest: WorkspaceManifest = {
    version: 1,
    workspaceId,
    name,
    created: new Date(),
    storageStats: StorageStatsSchema.parse({}),
    attachments: [],
    creator,
    type: 'workspace',
  }
  await createEntry(workspaceManifest)
  return workspaceManifest
}
