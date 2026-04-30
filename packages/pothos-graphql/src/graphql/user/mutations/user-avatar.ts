import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.mutationField('updateUserAvatar', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      avatarUrl: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { avatarUrl }, context) => {
      return prisma.user.update({
        ...query,
        where: { id: context.session.user.id },
        data: {
          avatarUrl,
        },
      })
    },
  }),
)
