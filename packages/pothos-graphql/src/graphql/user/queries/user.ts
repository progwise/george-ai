import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.queryField('user', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      email: t.arg.string(),
    },
    resolve: (query, _source, { email }) => {
      return prisma.user.findUnique({
        ...query,
        where: { email },
      })
    },
  }),
)
