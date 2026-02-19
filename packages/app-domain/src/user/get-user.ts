import { prisma } from '@george-ai/app-database'

import { User } from './user'

export const getUser = async (parameters: {
  userId?: string
  username?: string
  email?: string
}): Promise<User | null> => {
  const { username, userId, email } = parameters
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      defaultWorkspaceId: true,
      isAdmin: true,
      profile: {
        select: {
          id: true,
        },
      },
    },
    where: { ...(userId ? { id: userId } : {}), ...(email ? { email } : {}), ...(username ? { username } : {}) },
  })
  if (!user) {
    return null
  }
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    hasProfile: user.profile !== null,
    defaultWorkspaceId: user.defaultWorkspaceId,
    isAdmin: user.isAdmin,
  }
}
