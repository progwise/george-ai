import { prisma } from '@george-ai/app-database'
import { deleteUserAvatars } from '@george-ai/file-management'

export async function deleteUserAvatar(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    })

    await deleteUserAvatars(userId)
  })
}
