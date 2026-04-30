import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, createWorkspace } from '@george-ai/file-management'

import { logger } from '../common'
import { getWorkspaceManifest } from './get-workspace-manifest'

export async function fixMissingWorkspaceManifest(workspaceId: string): Promise<WorkspaceManifest> {
  const manifest = await getWorkspaceManifest(workspaceId)
  if (manifest) {
    return manifest
  }
  const workspace = await prisma.workspace.findFirstOrThrow({
    where: { id: workspaceId },
  })

  logger.warn('Fixing missing workspace manifest', { workspaceId, workspace })

  return await createWorkspace(workspace.id, {
    name: workspace.name,
    creator: `fix:missing:workspace:manifest:${workspace.id}`,
  })
}
