import { GraphQLError } from 'graphql'

import { prisma } from '../../../../app-database/src'

export async function canReadWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  })

  if (!membership) {
    throw new GraphQLError('You do not have access to this workspace')
  }
}

export async function canWriteWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: {
        in: ['OWNER', 'ADMIN', 'EDITOR'],
      },
    },
  })

  if (!membership) {
    throw new GraphQLError('You do not have write access to this workspace')
  }
}

export async function canAdminWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: {
        in: ['OWNER', 'ADMIN'],
      },
    },
  })

  if (!membership) {
    throw new GraphQLError('You do not have admin access to this workspace')
  }
}

export async function doesOwnWorkspaceOrThrow(workspaceId: string, userId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: 'OWNER',
    },
  })

  if (!membership) {
    throw new GraphQLError('You do not own this workspace')
  }
}
