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
      return prisma.aiLibrary.findMany({
        ...query,
        where: { participants: { some: { userId: context.session.user.id } } },
      })
    },
  }),
)
