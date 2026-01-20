import { prisma } from '../prisma'

export const getUserById = async (userId: string) => {
  const user = prisma.user.findFirstOrThrow({
    where: { id: userId },
    include: { profile: true },
  })
  return user
}

export const getUserByMail = async (email: string) => {
  const user = prisma.user.findFirst({
    where: { email },
    include: { profile: true },
  })
  return user
}

export const getWorkspaceMembership = async (userId: string, workspaceId?: string) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      ...(workspaceId ? { workspaceId } : {}),
    },
  })
  return membership
}
