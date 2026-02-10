import { prisma } from '@george-ai/app-database'

export async function getWorkspaceId({ libraryId }: { libraryId: string }) {
  const workspace = await prisma.aiLibrary.findFirstOrThrow({
    where: { id: libraryId },
    select: { workspaceId: true },
  })

  return workspace.workspaceId
}
