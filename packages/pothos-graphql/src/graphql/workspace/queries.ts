import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: Workspace queries')

// Query to get all workspaces for the current user
builder.queryField('workspaces', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['Workspace'],
    nullable: false,
    resolve: async (query, _root, _args, ctx) => {
      const workspaces = await prisma.workspace.findMany({
        ...query,
        where: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })

      return workspaces
    },
  }),
)

// Query to get a single workspace by ID
builder.queryField('workspace', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'Workspace',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workspace = await prisma.workspace.findFirst({
        ...query,
        where: {
          id: args.id,
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
      })

      return workspace
    },
  }),
)
