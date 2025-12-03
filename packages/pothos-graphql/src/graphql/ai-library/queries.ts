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
      // Any workspace member can access libraries in their workspace
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        ...query,
        where: { id: libraryId, workspaceId: context.workspaceId },
      })
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
      const workspaceId = context.workspaceId
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

      // Any workspace member can access all libraries in the workspace
      return prisma.aiLibrary.findMany({
        ...query,
        where: {
          workspaceId,
        },
        orderBy: orderByClause,
      })
    },
  }),
)
