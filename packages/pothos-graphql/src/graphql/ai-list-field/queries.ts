import { getAccessLibraryWhere, getCanAccessListWhere } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const ContentQueryResult = builder.simpleObject('ContentQueryResult', {
  fields: (t) => ({
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

      const fields = await prisma.aiListField.findMany({
        select: { id: true, name: true, listId: true, list: { select: { name: true } }, contentQuery: true },
        where: {
          AND: [
            { list: listAccessWhere },
            { list: { sources: { some: { library: libraryAccessWhere } } } },
            { contentQuery: { not: null } },
            args.listId ? { listId: args.listId } : {},
            args.libraryId ? { list: { sources: { some: { libraryId: { equals: args.libraryId } } } } } : {},
          ],
        },
        orderBy: [{ list: { name: 'asc' } }, { name: 'asc' }],
      })

      return fields.map((field) => ({
        fieldId: field.id,
        fieldName: field.name,
        listId: field.listId,
        listName: field.list.name,
        contentQuery: field.contentQuery!,
      }))
    },
  }),
)
