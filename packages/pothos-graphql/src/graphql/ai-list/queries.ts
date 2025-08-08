import { prisma } from '../../prisma'
import { builder } from '../builder'
import { canAccessListOrThrow } from './utils'

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
      const list = await prisma.aiList.findFirstOrThrow({ ...query, include: { participants: true }, where: { id } })
      canAccessListOrThrow(list, context.session.user)
      return list
    },
  }),
)
