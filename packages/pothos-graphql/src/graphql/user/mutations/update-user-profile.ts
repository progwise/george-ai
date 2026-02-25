import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

builder.mutationField('updateUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      profileId: t.arg.string({ required: true }),
      input: t.arg({
        type: builder.inputType('UserProfileInput', {
          fields: (t) => ({
            email: t.string({ required: true }),
            firstName: t.string({ required: false }),
            lastName: t.string({ required: false }),
            business: t.string({ required: false }),
            position: t.string({ required: false }),
            freeMessages: t.int({ required: false }),
            freeStorage: t.int({ required: false }),
          }),
        }),
        required: true,
      }),
    },
    resolve: async (query, _source, { input, profileId }) => {
      const existingProfile = await prisma.userProfile.findUnique({
        where: { id: profileId },
      })

      if (!existingProfile) {
        throw new Error(`User profile not found for profileId: ${profileId}`)
      }

      return prisma.userProfile.update({
        ...query,
        where: { id: profileId },
        data: {
          ...input,
        },
      })
    },
  }),
)
