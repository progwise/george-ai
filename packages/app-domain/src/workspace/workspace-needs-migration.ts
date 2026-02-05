import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'

export async function workspaceNeedsMigration({ workspaceId }: { workspaceId: string }): Promise<{
  needsMigration: boolean
  id: string
  name: string
  hasWorkspaceStorage: boolean
  hasVectorStore: boolean
}> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })

  if (!workspace) {
    throw new DomainError('Workspace not found', 'workspace')
  }

  const [manifest, vectorStoreExists] = await Promise.all([
    workspaceStorage.getWorkspace(workspaceId),
    vectorStore.existsWorkspace(workspaceId),
  ])

  return {
    needsMigration: !manifest || !vectorStoreExists,
    id: workspace.id,
    name: workspace.name,
    hasWorkspaceStorage: !!manifest,
    hasVectorStore: vectorStoreExists,
  }
}
