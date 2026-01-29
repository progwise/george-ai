import { getWorkspaceDir } from './directories'

import { rm } from 'fs/promises'

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  await rm(workspaceDir, { recursive: true, force: true })
}
