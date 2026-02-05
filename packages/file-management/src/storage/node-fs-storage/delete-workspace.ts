import { logger } from './commons'
import { getWorkspaceDir } from './directories'
import { exists } from './exists'

import { rm } from 'fs/promises'

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const existsWorkspace = await exists(workspaceId, {})
  if (!existsWorkspace) {
    logger.warn('Workspace with id does not exist, skipping deletion.', { workspaceId })
    return
  }
  const workspaceDir = await getWorkspaceDir(workspaceId)
  await rm(workspaceDir, { recursive: true, force: true })
}
