import { WorkspaceManifest } from '../../schemas'
import { getWorkspaceDir } from './directories'
import { exists } from './exists'
import { getWorkspaceManifest } from './metadata-files'

export async function getWorkspace(workspaceId: string): Promise<WorkspaceManifest | null> {
  if (!(await exists(workspaceId, {}))) {
    return null
  }
  const workspaceDir = await getWorkspaceDir(workspaceId)
  const workspaceManifest = await getWorkspaceManifest(workspaceDir)
  if (!workspaceManifest) {
    throw new Error(`Workspace manifest not found for workspaceId: ${workspaceId}`)
  }
  return workspaceManifest
}
