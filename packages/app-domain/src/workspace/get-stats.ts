import { Role, getRole } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, workspaceStorage } from '@george-ai/file-management'
import { EmbeddingInfo, vectorStore } from '@george-ai/vector-store'

interface WorkspaceStats {
  id: string
  name: string
  slug: string
  isDefault: boolean
  isAdmin: boolean
  roles: Role[]
  memberCount: number
  workspaceInfo: WorkspaceManifest | null
  embeddingInfo: EmbeddingInfo[] | null
}

export async function getStats(parameters: { workspaceId: string; userId: string }): Promise<WorkspaceStats | null> {
  {
    const { workspaceId, userId } = parameters

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
            user: {
              select: {
                isAdmin: true,
                defaultWorkspaceId: true,
              },
            },
          },
        },
      },
    })

    if (!workspace) {
      return null
    }

    const workspaceInfo = await workspaceStorage.getWorkspace(workspaceId)
    const embeddingInfo = await vectorStore.getEmbeddingInfo({ workspaceId })

    return {
      id: workspaceId,
      name: workspace.name,
      slug: workspace.slug,
      isDefault: workspace.members.some((member) => member.user.defaultWorkspaceId === workspaceId),
      isAdmin: workspace.members.some((member) => member.user.isAdmin),
      roles: workspace.members.map((member) => getRole(member.role)),
      memberCount: workspace._count.members,
      workspaceInfo: workspaceInfo,
      embeddingInfo: embeddingInfo,
    }
  }
}
