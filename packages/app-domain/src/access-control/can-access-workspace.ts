import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'
import { logger } from './common'

export async function canReadWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  })

  if (!membership) {
    throw new DomainError('You do not have access to this workspace', 'authorization')
  }
}

export async function canWriteWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: {
        in: ['owner', 'admin', 'editor'],
      },
    },
  })

  if (!membership) {
    logger.warn('Unauthorized write access attempt', { workspaceId, userId })
    throw new DomainError('You do not have write access to this workspace', 'authorization')
  }
}

export async function canAdminWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  })

  if (!membership) {
    logger.warn('Unauthorized admin access attempt', { workspaceId, userId })
    throw new DomainError('You do not have admin access to this workspace', 'authorization')
  }
}

export async function doesOwnWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: 'owner',
    },
  })

  if (!membership) {
    logger.warn('Unauthorized ownership access attempt', { workspaceId, userId })
    throw new DomainError('You do not own this workspace', 'authorization')
  }
}
