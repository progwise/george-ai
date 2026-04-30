import { prisma } from '@george-ai/app-database'

export const checkUser = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  return user !== null
}
