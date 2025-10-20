import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: ApiKey Queries')

builder.queryField('apiKeys', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['ApiKey'],
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { libraryId }, context) => {
      // Check if user has access to this library
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)

      // Return all API keys for this library
      return prisma.apiKey.findMany({
        ...query,
        where: { libraryId },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)
