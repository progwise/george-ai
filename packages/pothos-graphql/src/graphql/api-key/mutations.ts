import bcrypt from 'bcrypt'
import crypto from 'crypto'

import { prisma } from '@george-ai/app-domain'

import { canAccessLibraryOrThrow } from '../../domain'
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
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)

      // Generate a random API key (32 bytes = 64 hex characters)
      const key = crypto.randomBytes(32).toString('hex')

      // Hash the key for storage
      const keyHash = await bcrypt.hash(key, 10)

      // Create the API key record
      const apiKey = await prisma.apiKey.create({
        data: {
          name,
          keyHash,
          libraryId,
          userId: context.session.user.id,
        },
      })

      // Return the API key with the plain text key (only time it's revealed)
      return {
        id: apiKey.id,
        name: apiKey.name,
        key, // Plain text key
        libraryId: apiKey.libraryId,
        createdAt: apiKey.createdAt,
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
      // Get the API key to check library access
      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
        select: { libraryId: true },
      })

      if (!apiKey) {
        throw new Error('API key not found')
      }

      // Check if user has access to the library
      await canAccessLibraryOrThrow(apiKey.libraryId, context.session.user.id)

      // Delete the API key
      await prisma.apiKey.delete({
        where: { id },
      })

      return true
    },
  }),
)
