import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

import './workspaces'

import { canReadWorkspaceOrThrow, getWorkspaceManifest } from '@george-ai/app-domain'

// Query to get a single workspace by ID
builder.queryField('workspace', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'Workspace',
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { workspaceId }, { session }) => {
      const workspace = await prisma.workspace.findFirstOrThrow({
        ...query,
        where: {
          id: workspaceId,
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      })

      return workspace
    },
  }),
)

// Query to get a single workspace by ID
builder.queryField('workspaceManifest', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'WorkspaceManifest',
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const manifest = await getWorkspaceManifest(workspaceId)

      return manifest
    },
  }),
)
