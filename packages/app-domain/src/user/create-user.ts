import { prisma } from '@george-ai/app-database'

export async function createUser(params: {
  username: string
  defaultWorkspaceId: string
  email: string
  name?: string | null
}): Promise<{ userId: string }> {
  const { email, name, username, defaultWorkspaceId } = params

  const user = await prisma.user.create({
    select: {
      id: true,
    },
    data: {
      email,
      name,
      username,
      defaultWorkspaceId,
    },
  })
  return { userId: user.id }
}
