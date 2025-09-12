import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.queryField('aiLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      libraryId: t.arg.string(),
    },
    nullable: false,
    resolve: async (query, _source, { libraryId }, context) => {
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        ...query,
        where: { id: libraryId },
      })
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      return library
    },
  }),
)

builder.queryField('aiLibraries', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiLibrary'],
    nullable: false,
    resolve: (query, _source, _args, context) => {
      const user = context.session.user
      return prisma.aiLibrary.findMany({
        ...query,
        where: {
          OR: [
            { ownerId: user.id },
            {
              participants: { some: { userId: user.id } },
            },
          ],
        },
        orderBy: { name: 'asc' },
      })
    },
  }),
)
