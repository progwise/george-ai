import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

import './workspaces'

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
