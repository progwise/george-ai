import { canAccessLibraryOrThrow } from '../ai-library/check-participation'
import { builder, prisma } from '../builder'

builder.prismaObject('AiLibraryUpdate', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    libraryId: t.exposeID('libraryId', { nullable: false }),
    library: t.relation('library'),
    crawlerRunId: t.exposeID('crawlerRunId', { nullable: true }),
    crawlerRun: t.relation('crawlerRun', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    fileId: t.exposeID('fileId', { nullable: true }),
    file: t.relation('file', { nullable: true }),
    message: t.exposeString('message'),
    updateType: t.exposeString('updateType', { nullable: false }),
    // Fields for omitted files
    filePath: t.exposeString('filePath', { nullable: true }),
    fileName: t.exposeString('fileName', { nullable: true }),
    fileSize: t.exposeInt('fileSize', { nullable: true }),
    filterType: t.exposeString('filterType', { nullable: true }),
    filterValue: t.exposeString('filterValue', { nullable: true }),
  }),
})

const LibraryUpdateQueryResult = builder
  .objectRef<{ libraryId: string; crawlerId?: string; take: number; skip: number }>('AiLibraryUpdateQueryResult')
  .implement({
    description: 'Query result for AI library updates',
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      library: t.withAuth({ isLoggedIn: true }).prismaField({
        type: 'AiLibrary',
        nullable: false,
        resolve: async (query, root, _args, context) => {
          const library = await prisma.aiLibrary.findUniqueOrThrow({ where: { id: root.libraryId } })
          canAccessLibraryOrThrow(context, root.libraryId)
          return library
        },
      }),
      crawlerId: t.exposeString('crawlerId', { nullable: true }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      count: t.withAuth({ isLoggedIn: true }).field({
        type: 'Int',
        nullable: false,
        resolve: async (root, _args, context) => {
          canAccessLibraryOrThrow(context, root.libraryId)
          console.log('Counting AI library updates for library:', root.libraryId, 'and crawler:', root.crawlerId)
          return prisma.aiLibraryUpdate.count({
            where: { libraryId: root.libraryId, ...(root.crawlerId && { crawlerRun: { crawlerId: root.crawlerId } }) },
          })
        },
      }),
      updates: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryUpdate'],
        nullable: false,
        resolve: async (query, root, _args, context) => {
          canAccessLibraryOrThrow(context, root.libraryId)
          return prisma.aiLibraryUpdate.findMany({
            ...query,
            where: { libraryId: root.libraryId, ...(root.crawlerId && { crawlerRun: { crawlerId: root.crawlerId } }) },
            orderBy: { createdAt: 'desc' },
            take: root.take ?? 10,
            skip: root.skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiLibraryUpdates', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: LibraryUpdateQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.id({ required: true }),
      crawlerId: t.arg.id({ required: false }),
      take: t.arg.int({ defaultValue: 10, required: false }),
      skip: t.arg.int({ defaultValue: 0, required: false }),
    },
    resolve: (_root, args) => {
      return {
        libraryId: args.libraryId,
        crawlerId: args.crawlerId ?? undefined,
        take: args.take ?? 10,
        skip: args.skip ?? 0,
      }
    },
  }),
)
