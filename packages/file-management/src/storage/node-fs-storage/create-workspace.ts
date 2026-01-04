import { WorkspaceManifest } from '../../schemas'
import { createWorkspaceDir } from './directories'
import { saveWorkspaceManifest } from './metadata-files'

export async function createWorkspace(workspaceId: string, name: string): Promise<WorkspaceManifest> {
  const workspaceDir = await createWorkspaceDir(workspaceId)
  const manifest: WorkspaceManifest = {
    version: 1,
    id: workspaceId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {},
    usage: {
      activeBytes: 0,
      physicalBytes: 0,
      totalFileCount: 0,
      lastUpdated: new Date().toISOString(),
      activeFileCount: 0,
      integrityState: 'healthy',
    },
  }
  await saveWorkspaceManifest(workspaceDir, manifest)
  return manifest
}
