import fs from 'fs'

import { prisma } from '@george-ai/app-domain'

import { UPLOADS_PATH } from '../../global-config'

export const checkUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  return user
}

export const getUserByMail = async (email: string) => {
  const user = await prisma.user.findFirst({
    include: { profile: true },
    where: { email },
  })
  return user
}

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    include: { profile: true },
    where: { id: userId },
  })
  return user
}

export const updateUserAvatarUrl = async ({ userId, avatarUrl }: { userId: string; avatarUrl: string | null }) => {
  const user = await prisma?.user.update({
    where: { id: userId },
    data: { avatarUrl },
  })
  return user
}

export const getUserAvatarsPath = () => {
  const path = `${UPLOADS_PATH}/user-avatars`

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }

  return path
}
