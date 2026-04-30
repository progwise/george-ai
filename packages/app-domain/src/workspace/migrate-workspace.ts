import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, getWorkspace, migrate } from '@george-ai/file-management'

import { DomainError } from '../error'
import { invalidateWorkspace } from './invalidate-workspace'

export async function migrateWorkspace(parameters: { workspaceId: string }): Promise<WorkspaceManifest> {
  const { workspaceId } = parameters

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { id: true, name: true, libraries: { select: { id: true, name: true, embeddingModel: true } } },
  })

  await migrate.migrateWorkspace(workspaceId, {
    workspaceName: workspace.name,
  })

  await invalidateWorkspace(workspaceId)

  const workspaceManifest = await getWorkspace(workspaceId)

  if (!workspaceManifest) {
    throw new DomainError('Failed to retrieve workspace manifest after migration', 'workspace')
  }
  return workspaceManifest
}
