import { canAccessListOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { AiListFilterInput, ListItemsQueryResult } from './field-values'

console.log('Setting up: AiList queries')

builder.queryField('aiLists', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiList'],
    nullable: false,
    resolve: async (query, _source, _args, context) => {
      const user = context.session.user
      return prisma.aiList.findMany({
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

builder.queryField('aiList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      const list = await canAccessListOrThrow(id, context.session.user.id, {
        ...query,
        include: { participants: true },
      })
      return list
    },
  }),
)

builder.queryField('aiListItems', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ListItemsQueryResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      fieldIds: t.arg.stringList({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
      orderBy: t.arg.string({ required: false }),
      orderDirection: t.arg.string({ required: false }),
      filters: t.arg({ type: [AiListFilterInput!], required: false }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: async (_root, args, context) => {
      const list = await canAccessListOrThrow(args.listId, context.session.user.id, { include: { sources: true } })

      const fields = await prisma.aiListField.findMany({
        select: {
          id: true,
          name: true,
          sourceType: true,
          fileProperty: true,
          type: true,
        },

        where: { id: { in: args.fieldIds }, listId: args.listId },
      })

      return {
        list: list,
        fields: fields,
        take: args.take ?? 20,
        skip: args.skip ?? 0,
        orderBy: args.orderBy ?? undefined,
        orderDirection: args.orderDirection === 'desc' ? ('desc' as const) : ('asc' as const),
        filters: args.filters ?? [],
        showArchived: args.showArchived ?? false,
      }
    },
  }),
)
