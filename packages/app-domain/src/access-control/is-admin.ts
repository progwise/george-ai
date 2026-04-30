import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'

export async function isAdmin(params: { userId: string }): Promise<boolean> {
  const { userId } = params

  const result = await prisma.user.findFirst({
    where: { id: userId },
    select: { isAdmin: true },
  })

  return result?.isAdmin ?? false
}

export async function isAdminOrThrow(userId: string): Promise<void> {
  const admin = await isAdmin({ userId })
  if (!admin) {
    throw new DomainError('User does not have admin privileges', 'authorization')
  }
}
