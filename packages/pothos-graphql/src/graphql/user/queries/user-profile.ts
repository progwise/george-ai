import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.queryField('userProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    nullable: false,
    resolve: async (query, _source, _args, context) => {
      if (context.session.userProfile) {
        return context.session.userProfile
      }
      return prisma.userProfile.findFirstOrThrow({
        ...query,
        where: { userId: context.session.user.id },
      })
    },
  }),
)
