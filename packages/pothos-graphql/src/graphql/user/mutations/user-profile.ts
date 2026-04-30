import { prisma } from '@george-ai/app-database'
import { sendMail } from '@george-ai/mailer'

import { builder } from '../../builder'

builder.mutationField('confirmUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      profileId: t.arg.string({ required: true }),
    },
    resolve: (query, _source, { profileId }) => {
      return prisma.userProfile.update({
        ...query,
        where: { id: profileId },
        data: {
          confirmationDate: new Date(),
        },
      })
    },
  }),
)

builder.mutationField('sendConfirmationMail', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      confirmationUrl: t.arg.string({ required: true }),
      activationUrl: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { confirmationUrl, activationUrl }, context) => {
      const profile = await prisma.userProfile.findFirst({
        where: { email: context.session.user.email },
      })
      if (!profile) {
        throw new Error('Profile not found')
      }

      // Send email to the user
      await sendMail(
        profile.email,
        'Please confirm your email',
        'Thank you for registering at george-ai.net. Enter the following URL in your browser to confirm your email: ' +
          confirmationUrl,
        'Thank you for registering at george-ai.net. Enter the following URL in your browser to confirm your email: <a href="' +
          confirmationUrl +
          '">' +
          confirmationUrl +
          '</a>',
      )

      // Send email to the admin
      await sendMail(
        'info@george-ai.net',
        'Admin Activation Required',
        `A new user profile requires activation. User email: ${profile.email}. Confirm here: ${activationUrl}`,
        `<p>A new user profile requires activation. User email: ${profile.email}. Confirm here: <a href="${activationUrl}">${activationUrl}</a></p>`,
      )

      return true
    },
  }),
)

builder.mutationField('activateUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      profileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { profileId }) => {
      const userProfile = await prisma.userProfile.findFirst({
        where: {
          id: profileId,
        },
      })

      if (!userProfile) {
        throw new Error(`User profile not found for profileId: ${profileId}`)
      }

      const updatedProfile = await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: {
          activationDate: new Date(),
        },
      })

      // Send email activation notification to the user
      await sendMail(
        userProfile.email,
        'Profile Activation Successful',
        'Your profile has been successfully activated. You can now access all features.',
        '<p>Your profile has been successfully activated. You can now access all features.</p>',
      )

      return updatedProfile
    },
  }),
)
