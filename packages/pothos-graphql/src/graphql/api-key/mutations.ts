import { prisma } from '@george-ai/app-database'
import { apiKey, canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../builder'

// Type returned when generating a new API key (includes the plain text key)
const ApiKeyWithSecret = builder.simpleObject('ApiKeyWithSecret', {
  fields: (t) => ({
    id: t.id({ nullable: false }),
    name: t.string({ nullable: false }),
    key: t.string({ nullable: false }),
    workspaceId: t.string({ nullable: false }),
    userId: t.string({ nullable: false }),
    createdAt: t.field({ type: 'DateTime', nullable: false }),
  }),
})

builder.mutationField('generateApiKey', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ApiKeyWithSecret,
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (_source, { name }, { workspaceId, session }) => {
      // Check if user has access to this workspace
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      // Generate a random API key (32 bytes = 64 hex characters)
      const newKey = await apiKey.generateKey()

      // Create the API key record
      const apiKeyRecord = await prisma.apiKey.create({
        data: {
          name,
          keyHash: newKey.keyHash,
          workspaceId,
          userId: session.user.id,
        },
      })

      // Return the API key with the plain text key (only time it's revealed)
      return {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        key: newKey.key, // Plain text key
        workspaceId: apiKeyRecord.workspaceId,
        userId: apiKeyRecord.userId,
        createdAt: apiKeyRecord.createdAt,
      }
    },
  }),
)

builder.mutationField('revokeApiKey', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      await canAdminWorkspaceOrThrow(context.workspaceId, context.session.user.id)
      // Get the API key to check workspace access
      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
        select: { workspaceId: true },
      })

      if (!apiKey) {
        throw new Error('API key not found')
      }

      // Delete the API key
      await prisma.apiKey.delete({
        where: { id },
      })

      return true
    },
  }),
)
