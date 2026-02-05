import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'
import { logger } from './common'

export async function canCreateWorkspaceOrThrow(parameters: { workspaceId: string; userId: string }) {
  const { workspaceId, userId } = parameters
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: {
          userId,
        },
      },
    },
  })

  if (!workspace) {
    logger.error('Unauthorized create workspace attempt', { workspaceId, userId })
    throw new DomainError('Access denied', 'authorization')
  }
}
