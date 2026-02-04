import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { prisma } from '../../../../app-database/src'
import { apiKey } from '../../../../app-database/src'
import { builder } from '../builder'

console.log('Setting up: ApiKey Mutations')

// Type returned when generating a new API key (includes the plain text key)
const ApiKeyWithSecret = builder.simpleObject('ApiKeyWithSecret', {
  fields: (t) => ({
    id: t.id({ nullable: false }),
    name: t.string({ nullable: false }),
    key: t.string({ nullable: false }),
    libraryId: t.string({ nullable: false }),
    createdAt: t.field({ type: 'DateTime', nullable: false }),
  }),
})

builder.mutationField('generateApiKey', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ApiKeyWithSecret,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId, name }, context) => {
      // Check if user has access to this library
      await canAdminWorkspaceOrThrow(libraryId, context.session.user.id)

      // Generate a random API key (32 bytes = 64 hex characters)
      const newKey = await apiKey.generateKey()

      // Create the API key record
      const apiKeyRecord = await prisma.apiKey.create({
        data: {
          name,
          keyHash: newKey.keyHash,
          libraryId,
          userId: context.session.user.id,
        },
      })

      // Return the API key with the plain text key (only time it's revealed)
      return {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        key: newKey.key, // Plain text key
        libraryId: apiKeyRecord.libraryId,
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
      // Get the API key to check library access
      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
        select: { libraryId: true },
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
