import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-domain'

import { requireWorkspaceAdmin } from '../../domain/workspace'
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
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workspace = await prisma.workspace.findFirstOrThrow({
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

// Query to get all members of a workspace
builder.queryField('workspaceMembers', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceMember'],
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // First verify the user is a member of this workspace
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: args.workspaceId,
            userId: ctx.session.user.id,
          },
        },
      })

      if (!membership) {
        throw new GraphQLError('You are not a member of this workspace')
      }

      return prisma.workspaceMember.findMany({
        ...query,
        where: { workspaceId: args.workspaceId },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      })
    },
  }),
)

// Query to get pending invitations for a workspace (admin only)
builder.queryField('workspaceInvitations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceInvitation'],
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Verify the user is an admin of this workspace
      await requireWorkspaceAdmin(args.workspaceId, ctx.session.user.id)

      return prisma.workspaceInvitation.findMany({
        ...query,
        where: {
          workspaceId: args.workspaceId,
          acceptedAt: null, // Only pending invitations
        },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)

// Query to get pending invitations for the current user
builder.queryField('myWorkspaceInvitations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceInvitation'],
    nullable: false,
    resolve: async (query, _root, _args, ctx) => {
      const userEmail = ctx.session.user.email

      return prisma.workspaceInvitation.findMany({
        ...query,
        where: {
          email: userEmail,
          acceptedAt: null,
          expiresAt: { gt: new Date() }, // Not expired
        },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)

// Query to get a single invitation by ID (for accept-invitation page)
// Returns the invitation regardless of email match - frontend handles the different states
builder.queryField('workspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceInvitation',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args) => {
      return prisma.workspaceInvitation.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      })
    },
  }),
)
