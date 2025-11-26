import { getAccessLibraryWhere, getCanAccessListWhere } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const ContentQueryResult = builder.simpleObject('ContentQueryResult', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    fieldId: t.string({ nullable: false }),
    fieldName: t.string({ nullable: false }),
    listId: t.string({ nullable: false }),
    listName: t.string({ nullable: false }),
    contentQuery: t.string({ nullable: true }),
  }),
})

builder.queryField('aiContentQueries', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ContentQueryResult],
    nullable: { list: false, items: false },
    args: {
      listId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, context) => {
      const listAccessWhere = getCanAccessListWhere(context.session.user.id)
      const libraryAccessWhere = getAccessLibraryWhere(context.session.user.id)

      const fieldContextItems = await prisma.aiListFieldContext.findMany({
        select: {
          id: true,
          contextQuery: true,
          field: { select: { id: true, name: true, listId: true, list: { select: { name: true } } } },
        },
        where: {
          AND: [
            { contextType: 'vectorSearch' },
            { field: { list: listAccessWhere } },
            { field: { list: { sources: { some: { library: libraryAccessWhere } } } } },
            args.listId ? { field: { listId: args.listId } } : {},
            args.libraryId ? { field: { list: { sources: { some: { libraryId: { equals: args.libraryId } } } } } } : {},
          ],
        },
        orderBy: [{ field: { list: { name: 'asc' } } }, { field: { name: 'asc' } }],
      })

      return fieldContextItems.map((item) => {
        // Parse contextQuery JSON to extract queryTemplate
        const contextQuery = item.contextQuery as { queryTemplate?: string } | null
        const queryTemplate = contextQuery?.queryTemplate || null

        return {
          id: item.id,
          fieldId: item.field.id,
          fieldName: item.field.name,
          listId: item.field.listId,
          listName: item.field.list.name,
          contentQuery: queryTemplate,
        }
      })
    },
  }),
)
