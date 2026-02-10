import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.mutationField('toggleAdminStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }, context) => {
      if (!context.session.user.isAdmin) {
        throw new Error('Unauthorized: Only admins can toggle admin status')
      }
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
      return await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdmin: !user.isAdmin,
        },
        ...query,
      })
    },
  }),
)
