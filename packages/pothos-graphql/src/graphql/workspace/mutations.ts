import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: Workspace mutations')

// Custom type for deletion validation result
const WorkspaceDeletionValidation = builder.simpleObject('WorkspaceDeletionValidation', {
  fields: (t) => ({
    canDelete: t.boolean({ nullable: false }),
    libraryCount: t.int({ nullable: false }),
    assistantCount: t.int({ nullable: false }),
    listCount: t.int({ nullable: false }),
    message: t.string({ nullable: false }),
  }),
})

builder.mutationField('createWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'Workspace',
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { name, slug }, ctx) => {
      const userId = ctx.session.user.id

      // Validate slug format (lowercase, alphanumeric, hyphens only)
      const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
      const validatedSlug = slugSchema.parse(slug)

      try {
        // Create workspace and add creator as admin member
        const workspace = await prisma.workspace.create({
          ...query,
          data: {
            name,
            slug: validatedSlug,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return workspace
      } catch (error) {
        // Handle unique constraint violation for slug
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
          throw new GraphQLError(
            `Workspace with slug "${validatedSlug}" already exists. Please choose a different slug.`,
          )
        }
        throw error
      }
    },
  }),
)

builder.mutationField('validateWorkspaceDeletion', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: WorkspaceDeletionValidation,
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, ctx) => {
      const user = ctx.session.user

      // Check if user is workspace admin
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      })

      // Count related items
      const [libraryCount, assistantCount, listCount] = await Promise.all([
        prisma.aiLibrary.count({ where: { workspaceId } }),
        prisma.aiAssistant.count({ where: { workspaceId } }),
        prisma.aiList.count({ where: { workspaceId } }),
      ])

      if (!member || member.role !== 'ADMIN') {
        return {
          canDelete: false,
          libraryCount,
          assistantCount,
          listCount,
          message: 'Only workspace admins can delete workspaces',
        }
      }

      const totalItems = libraryCount + assistantCount + listCount
      const canDelete = totalItems === 0

      let message = ''
      if (canDelete) {
        message = 'Workspace is empty and can be deleted safely.'
      } else {
        const items: string[] = []
        if (libraryCount > 0) {
          items.push(`${libraryCount} ${libraryCount === 1 ? 'library' : 'libraries'}`)
        }
        if (assistantCount > 0) {
          items.push(`${assistantCount} ${assistantCount === 1 ? 'assistant' : 'assistants'}`)
        }
        if (listCount > 0) {
          items.push(`${listCount} ${listCount === 1 ? 'list' : 'lists'}`)
        }
        message = `Cannot delete workspace. Please delete ${items.join(', ')} first.`
      }

      return {
        canDelete,
        libraryCount,
        assistantCount,
        listCount,
        message,
      }
    },
  }),
)

builder.mutationField('deleteWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, ctx) => {
      const userId = ctx.session.user.id

      // Check if user is workspace admin
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      })

      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Only workspace admins can delete workspaces')
      }

      // Verify workspace is empty
      const [libraryCount, assistantCount, listCount] = await Promise.all([
        prisma.aiLibrary.count({ where: { workspaceId } }),
        prisma.aiAssistant.count({ where: { workspaceId } }),
        prisma.aiList.count({ where: { workspaceId } }),
      ])

      const totalItems = libraryCount + assistantCount + listCount
      if (totalItems > 0) {
        throw new GraphQLError(
          `Cannot delete workspace with existing items. Please delete ${libraryCount} libraries, ${assistantCount} assistants, and ${listCount} lists first.`,
        )
      }

      // Check if this is the user's default workspace
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultWorkspaceId: true },
      })

      if (user?.defaultWorkspaceId === workspaceId) {
        throw new GraphQLError('Cannot delete your default workspace. Please set another workspace as default first.')
      }

      // Delete workspace (cascade will handle members, providers)
      await prisma.workspace.delete({
        where: { id: workspaceId },
      })

      return true
    },
  }),
)
