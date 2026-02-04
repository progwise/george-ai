import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'

import { getSlugFromName, logger } from './common'

export async function create(params: { name: string; id?: string }) {
  const { name, id } = params
  logger.info('Creating workspace', { name })

  const workspace = await prisma.workspace.create({
    data: {
      id,
      name,
      slug: getSlugFromName(name),
    },
  })

  const workspaceInfo = await workspaceStorage.createWorkspace(workspace.id, {
    name: workspace.name,
  })

  return workspaceInfo
}
