import { logger } from '../commons'
import { getEntry } from '../entry'
import { WorkspaceManifest } from '../schema'

export async function getWorkspace(workspaceId: string): Promise<WorkspaceManifest | null> {
  logger.debug('Getting workspace', { workspaceId })

  const manifest = await getEntry({ type: 'workspace', workspaceId, version: 1 })

  return manifest
}
