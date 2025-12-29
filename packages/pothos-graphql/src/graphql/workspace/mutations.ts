import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '@george-ai/app-domain'

import {
  INVITATION_EXPIRY_DAYS,
  isLastAdmin,
  requireWorkspaceAdmin,
  requireWorkspaceOwner,
  sendWorkspaceInvitationEmail,
} from '../../domain/workspace'
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
                role: 'owner',
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

      // Check if user is workspace owner
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

      if (!member || member.role !== 'owner') {
        return {
          canDelete: false,
          libraryCount,
          assistantCount,
          listCount,
          message: 'Only workspace owners can delete workspaces',
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

      // Check if user is workspace owner
      await requireWorkspaceOwner(workspaceId, userId)

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

// Invite a member to a workspace (admin only)
builder.mutationField('inviteWorkspaceMember', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceInvitation',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      email: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { workspaceId, email }, ctx) => {
      const userId = ctx.session.user.id

      // Validate email format
      const emailSchema = z.string().email()
      const validatedEmail = emailSchema.parse(email.toLowerCase().trim())

      // Check if user is admin
      await requireWorkspaceAdmin(workspaceId, userId)

      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedEmail },
      })

      if (existingUser) {
        const existingMembership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: { workspaceId, userId: existingUser.id },
          },
        })

        if (existingMembership) {
          throw new GraphQLError('User is already a member of this workspace')
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.workspaceInvitation.findUnique({
        where: {
          workspaceId_email: { workspaceId, email: validatedEmail },
        },
      })

      if (existingInvitation && !existingInvitation.acceptedAt) {
        throw new GraphQLError('An invitation has already been sent to this email')
      }

      // Create invitation with expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS)

      const invitation = await prisma.workspaceInvitation.upsert({
        ...query,
        where: {
          workspaceId_email: { workspaceId, email: validatedEmail },
        },
        create: {
          workspaceId,
          email: validatedEmail,
          inviterId: userId,
          expiresAt,
        },
        update: {
          inviterId: userId,
          expiresAt,
          acceptedAt: null,
        },
      })

      // Send invitation email
      await sendWorkspaceInvitationEmail(invitation.id, workspaceId, userId, validatedEmail)

      return invitation
    },
  }),
)

// Revoke a pending invitation (admin only)
builder.mutationField('revokeWorkspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      invitationId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { invitationId }, ctx) => {
      const userId = ctx.session.user.id

      // Get the invitation
      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation) {
        throw new GraphQLError('Invitation not found')
      }

      // Check if user is admin of the workspace
      await requireWorkspaceAdmin(invitation.workspaceId, userId)

      // Delete the invitation
      await prisma.workspaceInvitation.delete({
        where: { id: invitationId },
      })

      return true
    },
  }),
)

// Remove a member from workspace (admin only, cannot remove self)
builder.mutationField('removeWorkspaceMember', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { workspaceId, userId: targetUserId }, ctx) => {
      const currentUserId = ctx.session.user.id

      // Cannot remove yourself (use leaveWorkspace instead)
      if (currentUserId === targetUserId) {
        throw new GraphQLError('Cannot remove yourself. Use "Leave Workspace" instead.')
      }

      // Check if current user is admin
      await requireWorkspaceAdmin(workspaceId, currentUserId)

      // Check if target is a member
      const targetMembership = await prisma.workspaceMember.findUnique({
        ...query,
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      if (!targetMembership) {
        throw new GraphQLError('User is not a member of this workspace')
      }

      // Remove the member
      await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      return targetMembership
    },
  }),
)

// Update a member's role (admin only, owner role requires current user to be owner)
builder.mutationField('updateWorkspaceMemberRole', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      role: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { workspaceId, userId: targetUserId, role }, ctx) => {
      const currentUserId = ctx.session.user.id

      // Validate role
      if (role !== 'admin' && role !== 'member' && role !== 'owner') {
        throw new GraphQLError('Invalid role. Must be "admin" or "member" or "owner".')
      }

      // Only owners can promote to owner, otherwise admin is sufficient
      if (role === 'owner') {
        await requireWorkspaceOwner(workspaceId, currentUserId)
      } else {
        await requireWorkspaceAdmin(workspaceId, currentUserId)
      }

      // Check if target is a member
      const targetMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      if (!targetMembership) {
        throw new GraphQLError('User is not a member of this workspace')
      }

      // Prevent demoting the last admin
      if ((targetMembership.role === 'admin' || targetMembership.role === 'owner') && role === 'member') {
        const isLast = await isLastAdmin(workspaceId, targetUserId)
        if (isLast) {
          throw new GraphQLError('Cannot demote the last admin. Promote another member first.')
        }
      }

      // Update the role
      return prisma.workspaceMember.update({
        ...query,
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
        data: { role },
      })
    },
  }),
)

// Leave a workspace (any member)
builder.mutationField('leaveWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { workspaceId }, ctx) => {
      const userId = ctx.session.user.id

      // Check if user is a member
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      })

      if (!membership) {
        throw new GraphQLError('You are not a member of this workspace')
      }

      // Owners cannot leave the workspace - they must transfer ownership or delete it
      if (membership.role === 'owner') {
        throw new GraphQLError('Owners cannot leave the workspace. Transfer ownership or delete the workspace.')
      }

      // Check if this is the user's default workspace
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultWorkspaceId: true },
      })

      if (user?.defaultWorkspaceId === workspaceId) {
        throw new GraphQLError('Cannot leave your default workspace. Set another workspace as default first.')
      }

      // Remove membership
      await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      })

      return true
    },
  }),
)

// Accept a workspace invitation
builder.mutationField('acceptWorkspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      invitationId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { invitationId }, ctx) => {
      const userId = ctx.session.user.id
      const userEmail = ctx.session.user.email

      // Get the invitation
      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation) {
        throw new GraphQLError('Invitation not found')
      }

      // Check if invitation is for this user's email
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        throw new GraphQLError('This invitation was sent to a different email address')
      }

      // Check if already accepted
      if (invitation.acceptedAt) {
        throw new GraphQLError('This invitation has already been accepted')
      }

      // Check if expired
      if (invitation.expiresAt < new Date()) {
        throw new GraphQLError('This invitation has expired')
      }

      // Check if already a member
      const existingMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: invitation.workspaceId, userId },
        },
      })

      if (existingMembership) {
        // Mark invitation as accepted and return existing membership
        await prisma.workspaceInvitation.update({
          where: { id: invitationId },
          data: { acceptedAt: new Date() },
        })
        throw new GraphQLError('You are already a member of this workspace')
      }

      // Create membership and mark invitation as accepted
      const [member] = await prisma.$transaction([
        prisma.workspaceMember.create({
          ...query,
          data: {
            workspaceId: invitation.workspaceId,
            userId,
            role: 'member',
          },
        }),
        prisma.workspaceInvitation.update({
          where: { id: invitationId },
          data: { acceptedAt: new Date() },
        }),
      ])

      return member
    },
  }),
)
