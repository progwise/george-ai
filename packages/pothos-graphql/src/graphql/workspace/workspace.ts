import { prisma } from '@george-ai/app-database'
import { WorkspaceRoleSchema } from '@george-ai/app-schema'
import { workspace } from '@george-ai/file-management'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../builder'

builder.prismaObject('Workspace', {
  name: 'Workspace',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    slug: t.exposeString('slug', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    isDefault: t.withAuth({ isLoggedIn: true }).boolean({
      nullable: false,
      resolve: async (workspace, _args, ctx) => {
        const user = ctx.session.user
        return workspace.id === user.defaultWorkspaceId
      },
    }),
    role: t.withAuth({ isLoggedIn: true }).field({
      type: 'WorkspaceRole',
      nullable: true,
      resolve: async (workspace, _args, ctx) => {
        const userId = ctx.session.user.id
        const member = await prisma.workspaceMember.findUnique({
          select: { role: true },
          where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
        })
        const result = member ? WorkspaceRoleSchema.parse(member.role) : null
        return result
      },
    }),
    membersCount: t.relationCount('members'),
    librariesCount: t.relationCount('libraries'),
    assistantsCount: t.relationCount('assistants'),
    listsCount: t.relationCount('lists'),
    automationsCount: t.relationCount('automations'),
    conversationsCount: t.relationCount('conversations'),
    manifest: t.field({
      type: 'WorkspaceManifest',
      nullable: true,
      resolve: async (parent) => {
        return await workspace.get(parent.id)
      },
    }),
    chunksCount: t.field({
      type: 'Int',
      nullable: true,
      resolve: async (workspace) => {
        const workspaceSettings = await getWorkspaceSettings(workspace.id)
        const embedding = workspaceSettings?.embedding
        if (!embedding || !embedding.modelDriver || !embedding.modelName) {
          return null
        }
        const count = await vectorStore.getChunkCount({
          workspaceId: workspace.id,
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
        })
        return count
      },
    }),
    embeddingStatistics: t.field({
      type: ['EmbeddingStatistic'],
      nullable: { list: true, items: false },
      resolve: async (workspace) => {
        const workspaceSettings = await getWorkspaceSettings(workspace.id)
        const embedding = workspaceSettings?.embedding
        if (!embedding || !embedding.modelDriver || !embedding.modelName) {
          return null
        }
        return await vectorStore.getEmbeddingStatistics({
          workspaceId: workspace.id,
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
        })
      },
    }),
  }),
})
