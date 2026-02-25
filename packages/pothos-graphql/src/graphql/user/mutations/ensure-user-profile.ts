import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.mutationField('ensureUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { userId }, context) => {
      if (!context.session.user.isAdmin) {
        throw new Error('Unauthorized: Only admins can access managed users count')
      }

      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId },
      })

      if (existingProfile) {
        return existingProfile
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })

      return await prisma.userProfile.create({
        data: {
          userId: user.id,
          email: user.email,
          firstName: user.given_name || '',
          lastName: user.family_name || '',
        },
      })
    },
  }),
)
