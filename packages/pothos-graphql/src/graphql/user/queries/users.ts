import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.queryField('users', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['User'],
    nullable: { list: false, items: false },
    resolve: async (query, _source, _args, context) => {
      return prisma.user.findMany({
        ...query,
        where: {
          id: { not: context.session.user.id },
        },
      })
    },
  }),
)
