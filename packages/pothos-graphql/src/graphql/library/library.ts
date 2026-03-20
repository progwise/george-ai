import { prisma } from '@george-ai/app-database'
import { WorkspaceRoleSchema } from '@george-ai/app-schema'
import { getLibrary } from '@george-ai/file-management'

import { builder } from '../builder'

builder.prismaObject('AiLibrary', {
  name: 'AiLibrary',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    workspace: t.relation('workspace', { nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    role: t.withAuth({ isLoggedIn: true }).field({
      type: 'WorkspaceRole',
      nullable: true,
      resolve: async (library, _args, { session }) => {
        const userId = session.user.id
        const member = await prisma.workspaceMember.findUnique({
          select: { role: true },
          where: { workspaceId_userId: { workspaceId: library.workspaceId, userId } },
        })
        const result = member ? WorkspaceRoleSchema.parse(member.role) : null
        return result
      },
    }),
    url: t.exposeString('url'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    filesCount: t.relationCount('files'),
    crawlers: t.relation('crawlers', { nullable: false }),
    crawlerCount: t.relationCount('crawlers'),
    autoProcessCrawledFiles: t.exposeBoolean('autoProcessCrawledFiles', { nullable: false }),
    manifest: t.field({
      type: 'LibraryManifest',
      nullable: true,
      resolve: async (library) => {
        const manifest = await getLibrary({ workspaceId: library.workspaceId, libraryId: library.id })
        return manifest
      },
    }),
  }),
})
