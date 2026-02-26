import { getWorkspaceRole } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
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
        const result = member ? getWorkspaceRole(member.role) : null
        return result
      },
    }),
    url: t.exposeString('url'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    filesCount: t.relationCount('files'),
    crawlers: t.relation('crawlers', { nullable: false }),
    crawlerCount: t.relationCount('crawlers'),
    embeddingModel: t.relation('embeddingModel'),
    embeddingTimeoutMs: t.exposeInt('embeddingTimeoutMs'),
    ocrModel: t.relation('ocrModel'),
    fileConverterOptions: t.exposeString('fileConverterOptions'),
    autoProcessCrawledFiles: t.exposeBoolean('autoProcessCrawledFiles', { nullable: false }),
    manifest: t.withAuth({ isLoggedIn: true }).field({
      type: 'LibraryManifest',
      nullable: true,
      resolve: async (library, _args, { workspaceId }) => {
        const manifest = await getLibrary({ workspaceId, libraryId: library.id })
        return manifest
      },
    }),
  }),
})
