import { prisma } from '../prisma'

export const getUserById = async (userId: string) => {
  const user = prisma.user.findFirstOrThrow({
    where: { id: userId },
    include: { profile: true },
  })
  return user
}

export const getUserByMail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { profile: true },
  })
  return user
}

export const getWorkspaceMembership = async (parameters: { userId: string; workspaceId: string }) => {
  const { userId, workspaceId } = parameters
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
    },
  })
  return membership
}
