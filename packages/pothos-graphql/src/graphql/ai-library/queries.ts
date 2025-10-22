import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const LibrarySortOrder = builder.enumType('LibrarySortOrder', {
  values: ['nameAsc', 'nameDesc', 'createdAtAsc', 'createdAtDesc', 'updatedAtAsc', 'updatedAtDesc'] as const,
})

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
    args: {
      orderBy: t.arg({ type: LibrarySortOrder, required: false }),
    },
    resolve: (query, _source, args, context) => {
      const user = context.session.user
      const orderBy = args.orderBy || 'updatedAtDesc'
      const orderByClause =
        orderBy === 'nameAsc'
          ? { name: 'asc' as const }
          : orderBy === 'nameDesc'
            ? { name: 'desc' as const }
            : orderBy === 'createdAtAsc'
              ? { createdAt: 'asc' as const }
              : orderBy === 'createdAtDesc'
                ? { createdAt: 'desc' as const }
                : orderBy === 'updatedAtAsc'
                  ? { updatedAt: 'asc' as const }
                  : { updatedAt: 'desc' as const }

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
        orderBy: orderByClause,
      })
    },
  }),
)
