import { WorkspaceManifest } from '../../schemas'
import { logger } from './commons'
import { getWorkspaceDir } from './directories'
import { exists } from './exists'
import { getWorkspaceManifest } from './metadata-files'

export async function getWorkspace(workspaceId: string): Promise<WorkspaceManifest | null> {
  logger.debug('Getting workspace', { workspaceId })

  const workspaceExists = await exists(workspaceId, {})
  if (!workspaceExists) {
    logger.warn('Workspace not found', { workspaceId })
    return null
  }
  const workspaceDir = getWorkspaceDir(workspaceId)
  const workspaceManifest = await getWorkspaceManifest(workspaceDir)
  if (!workspaceManifest) {
    logger.error('Workspace manifest not found', { workspaceId })
    throw new Error(`Workspace manifest not found for workspaceId: ${workspaceId}`)
  }
  return workspaceManifest
}
