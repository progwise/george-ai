import { UserProfile, prisma } from '@george-ai/app-database'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  return userProfile
}
